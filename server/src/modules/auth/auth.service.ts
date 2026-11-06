import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Session } from './entities/session.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const jwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET must be set');
  return secret;
};

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto, res: Response) {
    const existingUser = await this.userRepository.findOneBy({
      email: dto.email,
    });
    if (existingUser) {
      throw new ConflictException('Email exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      fullName: dto.fullName,
      email: dto.email,
      password: hashedPassword,
    });
    await this.userRepository.save(user);

    const session = this.sessionRepository.create({
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    await this.sessionRepository.save(session);

    this.setCookies(res, user.id, session.id);

    return {
      message: 'Registered successfully',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    };
  }

  async login(dto: LoginDto, res: Response) {
    const user = await this.userRepository.findOneBy({ email: dto.email });

    if (!user) {
      throw new ConflictException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid) {
      throw new ConflictException('Invalid credentials');
    }

    const session = this.sessionRepository.create({
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    await this.sessionRepository.save(session);

    this.setCookies(res, user.id, session.id);

    return {
      message: 'Logged in',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    };
  }

  async logout(req: Request, res: Response) {
    const sessionId = req.user?.['sessionId'];
    if (sessionId) {
      await this.sessionRepository.delete({ id: sessionId }).catch(() => null);
    }

    res.cookie('accessToken', '', { path: '/', maxAge: 0 });
    res.cookie('refreshToken', '', { path: '/api/auth/refresh', maxAge: 0 });

    return 'Logged out';
  }

  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies?.['refreshToken'];
    if (typeof refreshToken !== 'string') {
      throw new ConflictException('Session invalid');
    }

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: jwtSecret(),
      });

      const session = await this.sessionRepository.findOneBy({
        id: payload.sessionId,
      });

      if (!session) {
        throw new ConflictException('Session invalid');
      }

      const accessToken = this.jwtService.sign(
        { userId: session.userId, sessionId: session.id },
        { expiresIn: '15m', secret: jwtSecret() },
      );

      res.cookie(
        'accessToken',
        accessToken,
        this.cookieOptions('/', 15 * 60 * 1000),
      );

      return 'Token refreshed';
    } catch {
      throw new ConflictException('Session invalid');
    }
  }

  private setCookies(res: Response, userId: number, sessionId: number) {
    const accessToken = this.jwtService.sign(
      { userId, sessionId },
      { expiresIn: '15m', secret: jwtSecret() },
    );

    const refreshToken = this.jwtService.sign(
      { sessionId },
      { expiresIn: '30d', secret: jwtSecret() },
    );

    res.cookie(
      'accessToken',
      accessToken,
      this.cookieOptions('/', 15 * 60 * 1000),
    );

    res.cookie(
      'refreshToken',
      refreshToken,
      this.cookieOptions('/api/auth/refresh', 30 * 24 * 60 * 60 * 1000),
    );
  }

  private cookieOptions(path: string, maxAge: number) {
    const secure = process.env.NODE_ENV === 'production';
    return {
      httpOnly: true,
      secure,
      sameSite: secure ? ('none' as const) : ('lax' as const),
      path,
      maxAge,
    };
  }
}
