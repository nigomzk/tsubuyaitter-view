import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma/client';
import { logger } from '@/lib/logger/pino';

/**
 * ユーザー名一意性チェックAPI
 * @param req リクエスト
 * @returns レスポンス
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { username } = body;

        if (!username) {
            return NextResponse.json({ code: "1", message: 'ユーザー名は必須です。' }, { status: 400 });
        }

        // ユーザー名重複チェック
        const user = await prisma.user.findUnique({
            where: { username }
        });

        const isUnique = !user;

        return NextResponse.json({ is_unique: isUnique });

    } catch (error) {
        logger.error({ err: error }, 'ユーザー名重複チェックエラー');
        return NextResponse.json({ code: "9", message: 'Internal Server Error' }, { status: 500 });
    }
}
