import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from '../events/entities/event.entity';
import { EventRegistration } from '../events/entities/event-registration.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatConversation } from './entities/chat-conversation.entity';
import { ChatMessage } from './entities/chat-message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatConversation,
      ChatMessage,
      Event,
      EventRegistration,
    ]),
  ],
  controllers: [ChatController],
  providers: [ChatService, JwtAuthGuard],
})
export class ChatModule {}
