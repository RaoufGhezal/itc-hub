import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Session } from '../../auth/entities/session.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'varchar', length: 60 })
  password: string;

  @Column({ type: 'enum', enum: ['member', 'admin'], default: 'member' })
  role: 'member' | 'admin';

  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[];
}
