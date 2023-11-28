import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { TokenEntity } from './token.entity';
import { ProfileEntity } from './profile.entity';
import { MessageEntity } from './message.entity';
import { GroupEntity } from './group.entity';
import { UserPresenceEntity } from './user-presence.entity';

@Entity('users')
@ObjectType()
export class UserEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  password?: string;

  @OneToMany(() => TokenEntity, (token) => token.user)
  @JoinColumn()
  refreshTokens: TokenEntity[];

  @Field(() => ProfileEntity)
  @OneToOne(() => ProfileEntity, (profile) => profile.user, {
    cascade: ['insert', 'update'],
  })
  @JoinColumn()
  profile: ProfileEntity;

  @Field(() => [MessageEntity], { nullable: true })
  @OneToMany(() => MessageEntity, (message) => message.author, {
    nullable: true,
  })
  @JoinColumn()
  messages: MessageEntity[];

  @Field(() => [GroupEntity], { nullable: true })
  @ManyToMany(() => UserEntity, (user) => user.groups, { nullable: true })
  groups: GroupEntity[];

  @Field(() => UserPresenceEntity, { nullable: true })
  @OneToOne(() => UserPresenceEntity, (presence) => presence.user, {
    nullable: true,
  })
  @JoinColumn()
  presence: UserPresenceEntity;
}
