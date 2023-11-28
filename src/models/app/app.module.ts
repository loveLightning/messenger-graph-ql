import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { getEnvPath } from 'src/common/helpers/env.helper';
import { TypeOrmConfigService } from 'src/shared/typeorm/typeorm.service';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { ChatModule } from '../chat/chat.module';
import { MessageModule } from '../message/message.module';
import { ConversationModule } from '../conversation/conversation.module';
import { PubSubModule } from 'src/pubsub/pubsub.module';
import { EventsGatewayModule } from '../events/events.gateway.module';
import { UploadModule } from '../upload/upload.module';
import { MessageAttachmentsModule } from '../message-attachments/message-attachments.module';

const envFilePath: string = getEnvPath(`${__dirname}/common/envs`);

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath, isGlobal: true }),
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: {
        settings: {
          'request.credentials': 'include', // Otherwise cookies won't be sent
        },
      },
      installSubscriptionHandlers: true,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      subscriptions: {
        'graphql-ws': true,
        'subscriptions-transport-ws': {
          onConnect: (headersRaw: Record<string, unknown>) => {
            // Lowercase each header key
            const headers = Object.keys(headersRaw).reduce((dest, key) => {
              dest[key.toLowerCase()] = headersRaw[key];
              return dest;
            }, {});
            return {
              req: {
                headers: headers,
              },
            };
          },
          onDisconnect: () => {},
        },
      },
      context: ({ req, res }) => ({ req, res }),
    }),
    UsersModule,
    AuthModule,
    ChatModule,
    MessageModule,
    ConversationModule,
    EventsGatewayModule,
    PubSubModule,
    UploadModule,
    MessageAttachmentsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
