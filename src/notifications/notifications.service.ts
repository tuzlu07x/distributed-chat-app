import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import {
  connect,
  AmqpConnectionManager,
  ChannelWrapper,
} from 'amqp-connection-manager';
import { Channel, Options } from 'amqplib';
import { ChatGateway } from '../chat/chat.gateway';
import { ChatService } from 'src/chat/chat.service';

@Injectable()
export class NotificationsService implements OnModuleInit, OnModuleDestroy {
  private connection: AmqpConnectionManager;
  private channel: ChannelWrapper;

  constructor(
    private readonly chatGateway: ChatGateway,
    private readonly chatService: ChatService,
  ) {}

  async onModuleInit() {
    try {
      this.connection = connect(['amqp://localhost']);
      this.connection.on('disconnect', (err) =>
        console.error('AMQP connection lost!', err),
      );

      this.channel = this.connection.createChannel({
        json: false,
        setup: this.setupChannel.bind(this),
      });

      await this.channel.waitForConnect();
      console.log('AMQP Channel connected!');
    } catch (error) {
      console.error('Failed to initialize AMQP connection:', error);
    }
  }

  private async setupChannel(channel: Channel) {
    await channel.assertQueue('notifications', { durable: true });

    await channel.consume('notifications', async (msg) => {
      if (!msg) return;

      try {
        const notification = JSON.parse(msg.content.toString());
        await this.chatService.saveMessage(notification);

        this.chatGateway.server.emit(
          `notification:${notification.userId}`,
          notification,
        );

        channel.ack(msg);
      } catch (err) {
        console.error('Message processing error:', err);

        channel.nack(msg, false, true);
      }
    });
  }

  async sendNotification(userId: string, roomId: string, message: string) {
    const notification = {
      roomId,
      userId,
      content: message,
      timestamp: new Date(),
    };

    const options: Options.Publish = {
      persistent: true,
    };

    try {
      if (!this.channel) {
        console.error('Channel is not connected. Cannot send notification.');
        return;
      }

      await this.channel.sendToQueue(
        'notifications',
        Buffer.from(JSON.stringify(notification)),
        options,
      );
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  async onModuleDestroy() {
    try {
      await this.channel?.close();
      await this.connection?.close();
      console.log('AMQP connection and channel closed.');
    } catch (error) {
      console.error('Failed to close AMQP connection:', error);
    }
  }
}
