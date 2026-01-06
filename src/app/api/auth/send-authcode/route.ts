import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma/client';
import redis from '@/lib/redis/client';
import { sendEmail } from '@/lib/email/sender';
import { isValidEmail } from '@/lib/validation';
import crypto from 'crypto';
import { logger } from '@/lib/logger/pino';
import { CACHED_KEY } from '@/constants';

/**
 * 認証コード送信API
 * @param req リクエスト
 * @returns レスポンス
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, display_name } = body;

        if (!email) {
            logger.info('入力チェックエラー: メールアドレス必須')
            return NextResponse.json({ code: "1", message: 'メールアドレスが未入力です。' }, { status: 400 });
        }

        if (!isValidEmail(email)) {
            logger.info('入力チェックエラー: メールアドレス不正[' + email + ']')
            return NextResponse.json({ code: "1", message: 'メールアドレスが不正です。' }, { status: 400 });
        }

        // 表示名バリデーションチェック
        if (!display_name) {
            logger.info('入力チェックエラー: 表示名必須')
            return NextResponse.json({ code: "1", message: '表示名は必須です。' }, { status: 400 });
        }

        // 既存アカウントチェック
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            logger.info('既存アカウントチェック: 既存アカウント存在')
            return NextResponse.json({ code: "2", message: 'アカウント登録済みのメールアドレスです。' }, { status: 400 });
        }

        // 認証コード生成
        const code = crypto.randomInt(100000, 999999).toString();
        const redisKey = `${CACHED_KEY.AUTHCODE_PREFIX}${email}`;
        const redisValue = JSON.stringify({
            authcode: code,
            email: email,
            displayname: display_name
        });

        // Redisに認証コードを保存（有効期限：1時間）
        await redis.set(redisKey, redisValue, 'EX', 3600);

        // メール送信
        const sent = await sendEmail(email, '[Tsubuyaitter]メールアドレスの認証', `コードは ${code} です。`);

        if (!sent) {
            logger.info('メール送信失敗')
            return NextResponse.json({ code: "9", message: 'メール送信に失敗しました。' }, { status: 500 });
        }

        logger.info('認証コード送信成功')
        return NextResponse.json({ code: "0", message: '認証コードを送信しました。' });

    } catch (error) {
        logger.error({ err: error }, '認証コード送信エラー');
        return NextResponse.json({ code: "9", message: 'Internal Server Error' }, { status: 500 });
    }
}
