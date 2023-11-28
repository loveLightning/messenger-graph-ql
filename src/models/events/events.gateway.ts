import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { PubSubService } from 'src/pubsub/pubsub.service';

@WebSocketGateway()
export class EventsGateway {
  constructor(private eventsPubSub: PubSubService) {}

  @SubscribeMessage('newConversation')
  listenToNewConversations() {
    return this.eventsPubSub.asyncIterator('newConversation');
  }
}
