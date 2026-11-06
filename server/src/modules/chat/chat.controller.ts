import {
  Body,
  Controller,
  Get,
  Header,
  HttpException,
  Post,
  Req,
  Res,
  UseGuards,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';

type AuthenticatedRequest = Request & {
  user: { userId: number };
};

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(private readonly chatService: ChatService) {}

  @Get('history')
  @Header('Cache-Control', 'private, no-store')
  history(@Req() request: AuthenticatedRequest) {
    return this.chatService.history(request.user.userId);
  }

  @Post()
  async send(
    @Body() dto: SendMessageDto,
    @Req() request: AuthenticatedRequest,
    @Res() response: Response,
  ) {
    const stream = await this.chatService.prepareMessage(
      request.user.userId,
      dto.message,
    );

    response.status(200).set({
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    response.flushHeaders();

    try {
      await this.chatService.streamMessage(stream, response);
    } catch (error) {
      this.logger.error(
        `Chat response stream failed: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
      if (!response.writableEnded) {
        const message =
          error instanceof HttpException
            ? error.message
            : 'The assistant failed while generating a response. Please try again.';
        response.write(
          `event: error\ndata: ${JSON.stringify({ error: message })}\n\n`,
        );
        response.end();
      }
    }
  }
}
