import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './message.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  async saveMessage(data: {
    roomId: string;
    userId: string;
    content: string;
  }): Promise<Message> {
    const message = new this.messageModel({
      ...data,
    });
    return message.save();
  }
}
