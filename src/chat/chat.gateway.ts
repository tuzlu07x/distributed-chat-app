import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { createClient } from 'redis';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: true })
export class ChatGateway {
  @WebSocketServer() server: Server;
  private publisher = createClient();
  private subscriber = createClient();

  constructor(private readonly chatService: ChatService) {
    this.publisher.connect();
    this.subscriber.connect();
    this.subscriber.subscribe('chatChannel', (message) => {
      this.server.emit('messageReceived', JSON.parse(message));
    });
  }

  broadcastMessage(message: any) {
    this.server.emit('messageReceived', message);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    client: Socket,
    payload: { roomId: string; userId: string; content: string },
  ) {
    const message = await this.chatService.saveMessage(payload);
    await this.publisher.publish('chatChannel', JSON.stringify(message));
    return message;
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, roomId: string) {
    client.join(roomId);
    this.server.to(roomId).emit('userJoined', { userId: client.id, roomId });
  }
}
