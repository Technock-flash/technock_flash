import type { IFileUploader } from "../../domain/ports/IFileUploader";

export class LocalFileUploader implements IFileUploader {
  async upload(file: Express.Multer.File): Promise<string> {
    // With multer diskStorage, the file is already saved to disk.
    // We return the URL path relative to the server root.
    // NOTE: Ensure your Express app serves the 'uploads' folder statically:
    // app.use('/uploads', express.static(path.join(__dirname, '../../../uploads')));
    return `/uploads/${file.filename}`;
  }

  async uploadMany(files: Express.Multer.File[]): Promise<string[]> {
    return Promise.all(files.map((file) => this.upload(file)));
  }
}