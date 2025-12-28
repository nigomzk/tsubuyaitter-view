import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma/client';
import { createToken } from '@/lib/auth/token';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { logger } from '@/lib/logger/pino';

/**
 * ログインAPI
 * @param req リクエスト
 * @returns レスポンス
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { identifier, password } = body;

        if (!identifier || !password) {
            return NextResponse.json({ code: "1", message: 'IDとパスワードを入力してください。' }, { status: 400 });
        }

        // メールアドレス または ユーザー名 で検索
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { username: identifier }
                ]
            }
        });

        if (!user) {
            return NextResponse.json({ code: "1", message: 'IDまたはパスワードが間違っています。' }, { status: 401 });
        }

        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
            return NextResponse.json({ code: "1", message: 'IDまたはパスワードが間違っています。' }, { status: 401 });
        }

        // アクセストークン作成
        const token = await createToken({ id: user.id, username: user.username, email: user.email });

        // Cookie に設定
        const cookieStore = await cookies();
        cookieStore.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24, // 有効期間1日間
            path: '/'
        });

        return NextResponse.json({ code: "0", message: 'ログインしました。' });

    } catch (error) {
        logger.error('Login error:' + error);
        return NextResponse.json({ code: "9", message: 'Internal Server Error' }, { status: 500 });
    }
}
