import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'events' })
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'timestamptz' })
  date: Date;

  @Column()
  location: string;

  @Column()
  department: string;

  @Column({ type: 'int', nullable: true, default: null })
  capacity: number | null;

  @Column({ type: 'varchar', nullable: true })
  image: string | null;
}
