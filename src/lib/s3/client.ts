import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { logger } from '@/lib/logger/pino';

/**
 * S3クライアント
 */
const s3Client = new S3Client({
    region: process.env.S3_REGION!,
    endpoint: process.env.S3_ENDPOINT!,
    forcePathStyle: true, // Required for MinIO
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_KEY!,
    },
});

/**
 * S3バケット名
 */
export const BUCKET_NAME = process.env.S3_BUCKET!;

/**
 * S3クライアント
 */
export default s3Client;
