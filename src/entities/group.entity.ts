import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { GroupMessageEntity } from './group.message.entity';

@Entity('groups')
@ObjectType()
export class GroupEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  title?: string;

  @Field(() => [UserEntity])
  @ManyToMany(() => UserEntity, (user) => user.groups)
  @JoinTable()
  users: UserEntity[];

  @Field(() => UserEntity)
  @OneToOne(() => UserEntity, { createForeignKeyConstraints: false })
  @JoinColumn()
  creator: UserEntity;

  @Field(() => UserEntity)
  @OneToOne(() => UserEntity, { createForeignKeyConstraints: false })
  @JoinColumn()
  owner: UserEntity;

  @Field(() => [GroupMessageEntity])
  @OneToMany(() => GroupMessageEntity, (message) => message.group, {
    cascade: ['insert', 'remove', 'update'],
  })
  @JoinColumn()
  messages: GroupMessageEntity[];

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: number;

  @Field(() => GroupMessageEntity)
  @OneToOne(() => GroupMessageEntity)
  @JoinColumn({ name: 'last_message_sent' })
  lastMessageSent: GroupMessageEntity;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  lastMessageSentAt: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  avatar?: string;
}
