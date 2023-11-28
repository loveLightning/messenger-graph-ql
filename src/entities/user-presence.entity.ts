import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('user_presence')
@ObjectType()
export class UserPresenceEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  statusMessage?: string;

  @Field({ defaultValue: false })
  @Column({ default: false })
  showOffline: boolean;

  @Field(() => UserEntity)
  @OneToOne(() => UserEntity, (user) => user.presence)
  @JoinColumn()
  user: UserEntity;
}
