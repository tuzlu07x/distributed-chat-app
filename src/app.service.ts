import { Injectable } from '@nestjs/common';
import { ChatGateway } from './chat/chat.gateway';
import { NotificationsService } from './notifications/notifications.service';

@Injectable()
export class AppService {
  constructor(
    private readonly chatGateway: ChatGateway,
    private readonly notificationsService: NotificationsService,
  ) {}
  async sendMessage(content: string): Promise<string> {
    const message = {
      roomId: 'testRoom',
      userId: 'appUser',
      content,
      timestamp: new Date().toISOString(),
    };

    this.chatGateway.broadcastMessage(message);

    await this.notificationsService.sendNotification(
      message.userId,
      message.roomId,
      message.content,
    );

    return `Message sent: ${content}`;
  }
}
