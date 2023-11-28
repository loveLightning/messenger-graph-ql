import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { PubSubService } from 'src/pubsub/pubsub.service';

@Module({
  providers: [EventsGateway, PubSubService],
})
export class EventsGatewayModule {}
