import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import prisma from '@/lib/prisma/client';
import s3Client, { BUCKET_NAME } from '@/lib/s3/client';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { S3_KEY } from '@/constants';
import { logger } from '@/lib/logger/pino';

// 最大サイズ 5MB
const MAX_SIZE = 5 * 1024 * 1024;
// 画像のみ
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

/**
 * プロフィール画像更新API
 * @param req リクエスト
 * @returns レスポンス
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ code: "1", message: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ code: "1", message: 'No file uploaded' }, { status: 400 });
        }

        if (file.size > MAX_SIZE) {
            return NextResponse.json({ code: "1", message: 'File size too large (Max 5MB)' }, { status: 400 });
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json({ code: "1", message: 'Invalid file type' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const ext = file.type.split('/')[1];
        const filename = `/${session.id}/${S3_KEY.PROFILE}/${uuidv4()}.${ext}`;

        // S3へアップロード
        await s3Client.send(new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: filename,
            Body: buffer,
            ContentType: file.type,
        }));

        // CDN URLでDBに登録
        const imageUrl = `${process.env.CDN_ENDPOINT}/${BUCKET_NAME}/${filename}`;

        // DB更新
        await prisma.user.update({
            where: { id: session.id },
            data: { profileImageUrl: imageUrl }
        });

        return NextResponse.json({ code: "0", message: 'Profile image updated', data: { url: imageUrl } });

    } catch (error) {
        logger.error('Upload error:' + error);
        return NextResponse.json({ code: "9", message: 'Internal Server Error' }, { status: 500 });
    }
}
