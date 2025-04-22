import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatModule } from './chat/chat.module';
import { NotificationsService } from './notifications/notifications.service';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/distributed-chat'),
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService, NotificationsService],
})
export class AppModule {}
