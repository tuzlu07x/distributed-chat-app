import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { Message, MessageSchema } from './message.schema';
import { NotificationsService } from '../notifications/notifications.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
  ],
  providers: [ChatService, NotificationsService, ChatGateway],
  exports: [ChatGateway, ChatService],
})
export class ChatModule {}
