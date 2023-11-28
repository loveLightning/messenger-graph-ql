import { Stream } from 'stream';
import { FileUpload } from 'graphql-upload';

export interface FileUploadType {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => Stream;
}

export interface SaveFileTypes {
  upload: Promise<FileUpload>;
}

export interface SaveFileToFolderTypes {
  fullpath: string;
  createReadStream: () => Stream;
}

export const IMAGE_FORMATS = ['jpg', 'jpeg', 'png'];
export const IMAGE_MAX_SIZE = 5 * 1024 * 1024; // 5MB

export const VIDEO_FORMATS = ['mp4', 'mov'];
export const VIDEO_MAX_SIZE = 50 * 1024 * 1024;

export const DOC_FORMATS = ['doc', 'docx', 'txt', 'pdf'];
export const DOC_MAX_SIZE = 10 * 1024 * 1024;

export const ROOT_FOLDER = '/uploads';

export enum FileFoldersEnum {
  AVATAR_FOLDER = 'avatars',
  PHOTO_FOLDER = 'photos',
  VIDEO_FOLDER = 'videos',
  AUDIO_FOLDER = 'audios',
  DOC_FOLDER = 'doc',
}
