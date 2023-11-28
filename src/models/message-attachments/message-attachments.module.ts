import { Module } from '@nestjs/common';
import { MessageAttachmentsService } from './message-attachments.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageAttachmentEntity } from 'src/entities';
import { UploadService } from '../upload/upload.service';

@Module({
  imports: [TypeOrmModule.forFeature([MessageAttachmentEntity])],
  providers: [MessageAttachmentsService, UploadService],
  exports: [MessageAttachmentsService],
})
export class MessageAttachmentsModule {}
