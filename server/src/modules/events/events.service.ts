import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { redis } from '../../config/redis';
import { CreateEventDto } from './dto/create-event.dto';
import { EventRegistration } from './entities/event-registration.entity';
import { Event } from './entities/event.entity';

const CACHE_SECONDS = 60;

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(EventRegistration)
    private readonly registrationRepository: Repository<EventRegistration>,
    private readonly dataSource: DataSource,
  ) {}

  async list(upcoming = false) {
    const cacheKey = `events:list:${upcoming}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const query = this.eventRepository
      .createQueryBuilder('event')
      .orderBy('event.date', 'DESC');
    if (upcoming) query.where('event.date >= :now', { now: new Date() });
    const events = await query.getMany();

    await redis.setEx(cacheKey, CACHE_SECONDS, JSON.stringify(events));
    return events;
  }

  async getById(id: number) {
    const cacheKey = `events:id:${id}`;
    const cached = await redis.get(cacheKey);
    const event = cached
      ? (JSON.parse(cached) as Event)
      : await this.eventRepository.findOneBy({ id });
    if (!event) throw new NotFoundException('Event not found');

    if (!cached) {
      await redis.setEx(cacheKey, CACHE_SECONDS, JSON.stringify(event));
    }

    const registeredCount = await this.registrationRepository.countBy({
      eventId: id,
    });
    return { ...event, registeredCount };
  }

  async create(dto: CreateEventDto) {
    const event = this.eventRepository.create({
      ...dto,
      date: new Date(dto.date),
      capacity: dto.capacity ?? null,
    });
    const savedEvent = await this.eventRepository.save(event);
    await this.invalidateCache();
    return savedEvent;
  }

  async register(eventId: number, userId: number) {
    await this.dataSource.transaction(async (manager) => {
      const event = await manager.findOne(Event, {
        where: { id: eventId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!event) throw new NotFoundException('Event not found');

      const registrations = manager.getRepository(EventRegistration);
      const existing = await registrations.findOneBy({ eventId, userId });
      if (existing) {
        throw new ConflictException('Already registered for this event');
      }

      const registrationCount = await registrations.countBy({ eventId });
      if (event.capacity !== null && registrationCount >= event.capacity) {
        throw new ConflictException('Event is at capacity');
      }

      await registrations.save(registrations.create({ eventId, userId }));
    });

    await this.invalidateCache();
    return { message: 'Registered for event' };
  }

  private async invalidateCache() {
    const keys = await redis.keys('events:*');
    if (keys.length > 0) await redis.del(keys);
  }
}
