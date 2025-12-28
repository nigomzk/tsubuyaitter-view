import { NextRequest, NextResponse } from 'next/server';
import redis from '@/lib/redis/client';

/**
 * 認証コード検証API
 * @param req リクエスト
 * @returns レスポンス
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, authcode } = body;

        if (!email || !authcode) {
            return NextResponse.json({ code: "1", message: 'メールアドレスと認証コードは必須です。' }, { status: 400 });
        }

        const redisKey = `verification:${email}`;
        const storedCode = await redis.get(redisKey);

        if (!storedCode) {
            return NextResponse.json({ code: "1", message: '認証コードが見つかりません。' }, { status: 400 });
        }

        const parsed = JSON.parse(storedCode);
        if (parsed.authcode === authcode) {
            return NextResponse.json({ code: "0", message: '認証に成功しました。' });
        } else {
            return NextResponse.json({ code: "1", message: '認証に失敗しました。' }, { status: 400 });
        }

    } catch (error) {
        console.error('Verify Authcode error:', error);
        return NextResponse.json({ code: "9", message: 'Internal Server Error' }, { status: 500 });
    }
}
