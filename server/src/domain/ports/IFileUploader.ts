/// <reference types="multer" />

export interface IFileUploader {
  upload(file: Express.Multer.File): Promise<string>;
  uploadMany(files: Express.Multer.File[]): Promise<string[]>;
  delete?(url: string): Promise<void>;
}