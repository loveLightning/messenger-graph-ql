import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageAttachmentEntity } from 'src/entities';
import { FileUpload } from 'graphql-upload';
import { UploadService } from '../upload/upload.service';
import * as fs from 'fs';
import { join } from 'path';
import { ROOT_FOLDER } from 'src/types/file.type';

@Injectable()
export class MessageAttachmentsService {
  constructor(
    @InjectRepository(MessageAttachmentEntity)
    private readonly attachmentRepository: Repository<MessageAttachmentEntity>,
    // @InjectRepository(GroupMessageAttachmentEn)
    // private readonly groupAttachmentRepository: Repository<GroupMessageAttachment>,
    private uploadService: UploadService,
  ) {}

  async create(attachmentsPromise: Promise<FileUpload[]>) {
    const attachments = await attachmentsPromise;

    const createdAttachments = Promise.all(
      attachments.map(async (attachment) => {
        const newAttachment = this.attachmentRepository.create();

        const fullpath = await this.uploadService.saveFile({
          upload: attachment as unknown as Promise<FileUpload>,
        });

        newAttachment.fullpath = fullpath;

        const savedAttachment = await this.attachmentRepository.save(
          newAttachment,
        );
        return savedAttachment;
      }),
    );

    return createdAttachments;
  }

  async update(attachmentPromise: Promise<FileUpload>, attachmentId: number) {
    const existsAttachment = await this.attachmentRepository.findOne({
      where: {
        id: attachmentId,
      },
    });

    if (!existsAttachment) throw new NotFoundException('Attachment not found');

    const fullpath = await this.uploadService.saveFile({
      upload: attachmentPromise,
    });

    fs.unlink(
      join(process.cwd(), `./src/${ROOT_FOLDER}/${existsAttachment.fullpath}`),
      (err) => {
        if (err) {
          console.error(err);
          return err;
        }
      },
    );

    existsAttachment.fullpath = fullpath;

    return await this.attachmentRepository.save(existsAttachment);
  }
}
