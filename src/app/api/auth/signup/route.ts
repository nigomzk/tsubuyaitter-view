import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma/client';
import redis from '@/lib/redis/client';
import { createToken } from '@/lib/auth/token';
import { isValidEmail, isValidPassword, isValidUsername } from '@/lib/validation';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { logger } from '@/lib/logger/pino';
import { CACHED_KEY } from '@/constants';

/**
 * サインアップAPI
 * @param req リクエスト
 * @returns レスポンス
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password, username, authcode } = body;

        // 入力チェック
        if (!email || !password || !username || !authcode) {
            return NextResponse.json({ code: "1", message: '全ての項目を入力してください。' }, { status: 400 });
        }
        if (!isValidEmail(email)) return NextResponse.json({ code: "1", message: 'メールアドレスが不正です。' }, { status: 400 });
        if (!isValidPassword(password)) return NextResponse.json({ code: "1", message: 'パスワードは8文字以上必要です。' }, { status: 400 });
        if (!isValidUsername(username)) return NextResponse.json({ code: "1", message: 'ユーザー名が不正です。半角英数記号(_)のみ利用可能です。' }, { status: 400 });

        // 認証コード検証
        const redisKey = `${CACHED_KEY.AUTHCODE_PREFIX}${email}`;
        const storedData = await redis.get(redisKey);

        if (!storedData) {
            return NextResponse.json({ code: "1", message: '認証コードが見つかりません。' }, { status: 400 });
        }

        let valid = false;
        let displayName = '';

        try {
            const parsed = JSON.parse(storedData);
            if (parsed.authcode === authcode) {
                valid = true;
                displayName = parsed.displayname;
            }
        } catch (e) {
            logger.error('JSON Parse Error:' + e);
            return NextResponse.json({ code: "1", message: '認証コードが正しくないか、期限切れです。' }, { status: 400 });
        }

        if (!valid) {
            return NextResponse.json({ code: "1", message: '認証コードが正しくないか、期限切れです。' }, { status: 400 });
        }

        // 重複チェック
        const existingUser = await prisma.user.findFirst({
            where: { OR: [{ email }, { username }] }
        });
        if (existingUser) {
            const msg = existingUser.email === email ? 'メールアドレスは既に使用されています。' : 'ユーザー名は既に使用されています。';
            return NextResponse.json({ code: "2", message: msg }, { status: 409 });
        }

        // パスワードハッシュ化
        const passwordHash = await bcrypt.hash(password, 10);

        // ユーザー作成
        const user = await prisma.user.create({
            data: {
                email,
                username,
                passwordHash,
                displayName: displayName,
            }
        });

        // トークン作成
        const token = await createToken({ id: user.id, username: user.username, email: user.email });

        // Cookie設定
        const cookieStore = await cookies();
        cookieStore.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24, // 1 day
            path: '/'
        });

        // Redisから認証コード削除
        await redis.del(redisKey);

        return NextResponse.json({ code: "0", message: 'アカウントを作成しました。' });

    } catch (error) {
        logger.error({ err: error }, 'サインアップエラー');
        return NextResponse.json({ code: "9", message: 'Internal Server Error' }, { status: 500 });
    }
}
