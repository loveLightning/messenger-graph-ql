import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@Entity('profiles')
@ObjectType()
export class ProfileEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  fullname: string;

  @Field({ defaultValue: '' })
  @Column({ default: '' })
  about?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  banner?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  avatar_url?: string;

  @Field({ nullable: true })
  @Column({ unique: true, nullable: true })
  mobile_number?: string;

  @Field(() => UserEntity)
  @OneToOne(() => UserEntity, (user) => user.profile)
  user: UserEntity;
}
