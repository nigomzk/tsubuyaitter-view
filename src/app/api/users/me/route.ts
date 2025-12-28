import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import prisma from '@/lib/prisma/client';
import { logger } from '@/lib/logger/pino';

/**
 * プロフィール取得API
 * @param req リクエスト
 * @returns レスポンス
 */
export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            logger.info('プロフィール取得API: セッションなし')
            return NextResponse.json({ code: "1", message: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.id },
            select: {
                id: true,
                username: true,
                email: true,
                displayName: true,
                profileImageUrl: true,
            }
        });

        if (!user) {
            logger.info('プロフィール取得API: ユーザーなし')
            return NextResponse.json({ code: "1", message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            code: "0",
            message: 'Profile retrieved',
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                display_name: user.displayName,
                profile_image_url: user.profileImageUrl
            }
        });

    } catch (error) {
        logger.error('プロフィール取得APIエラー:' + error);
        return NextResponse.json({ code: "9", message: 'Internal Server Error' }, { status: 500 });
    }
}
