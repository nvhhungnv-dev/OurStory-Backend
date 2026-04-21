import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class AssetService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(file: Express.Multer.File): Promise<{ url: string }> {
    if (!file) throw new BadRequestException('Không có file');

    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: 'ourstory', resource_type: 'image' }, (error, result) => {
          if (error || !result) return reject(new BadRequestException('Upload thất bại'));
          resolve({ url: result.secure_url });
        })
        .end(file.buffer);
    });
  }
}
