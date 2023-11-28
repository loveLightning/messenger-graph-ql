import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { v4 as uuid } from 'uuid';

import {
  DOC_FORMATS,
  DOC_MAX_SIZE,
  IMAGE_FORMATS,
  IMAGE_MAX_SIZE,
  ROOT_FOLDER,
  SaveFileToFolderTypes,
  SaveFileTypes,
  VIDEO_FORMATS,
  VIDEO_MAX_SIZE,
} from 'src/types/file.type';

@Injectable()
export class UploadService {
  constructor() {}

  async saveFile({ upload }: SaveFileTypes): Promise<string> {
    const { createReadStream, filename } = await upload;
    const extension = filename.split('.').pop().toLowerCase();
    const fullpath = uuid() + '.' + extension;

    if (!IMAGE_FORMATS.includes(extension)) {
      if (createReadStream().readableLength > IMAGE_MAX_SIZE) {
        throw new Error('File size exceeds the allowed limit.');
      }
    } else if (!VIDEO_FORMATS.includes(extension)) {
      if (createReadStream().readableLength > VIDEO_MAX_SIZE) {
        throw new Error('File size exceeds the allowed limit.');
      }
    } else if (!DOC_FORMATS.includes(extension)) {
      if (createReadStream().readableLength > DOC_MAX_SIZE) {
        throw new Error('Video is too large!');
      }
    } else {
      throw new Error('Invalid file format.');
    }

    await this.saveFileToFolder({
      createReadStream,
      fullpath,
    });

    return fullpath;
  }

  private async saveFileToFolder({
    createReadStream,
    fullpath,
  }: SaveFileToFolderTypes) {
    return new Promise(async (resolve) => {
      createReadStream()
        .pipe(
          createWriteStream(
            join(process.cwd(), `./src/${ROOT_FOLDER}/${fullpath}`),
          ),
        )
        .on('finish', () => resolve(true))
        .on('error', () => {
          new HttpException('Could not save file', HttpStatus.BAD_REQUEST);
        });
    });
  }
}
