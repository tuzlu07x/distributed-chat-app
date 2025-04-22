import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  message(): any {
    this.appService.sendMessage('Hello this is a test message');
    return {
      message: 'Message sent successfully',
      timestamp: new Date().toISOString(),
    };
  }
}
