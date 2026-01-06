import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma/client';
import redis from '@/lib/redis/client';

const CACHE_KEY = 'master:sidebar-menu';

/**
 * サイドメニューバー項目取得API
 * @returns 
 */
export async function GET() {
    try {
        // キャッシュDBからサイドバーメニュー定義取得
        const cachedMenu = await redis.get(CACHE_KEY);
        if (cachedMenu) {
            return NextResponse.json(JSON.parse(cachedMenu), { status: 200 });
        }

        // サイドバーメニュー定義取得 (キャッシュミス時)
        const sidebarMenuItems = await prisma.sidebarMenuItem.findMany({
            orderBy: {
                id: 'asc',
            },
        });

        const responseBody = {
            sidebar_menu: sidebarMenuItems.map((item) => ({
                item_id: item.id,
                icon: item.icon,
                text: item.text,
                destination: item.destination,
            })),
        };

        // キャッシュDB更新
        await redis.pipeline()
            .set(CACHE_KEY, JSON.stringify(responseBody))
            .expire(CACHE_KEY, 60 * 60) // 1 hour
            .exec();

        // レスポンス返却
        return NextResponse.json(responseBody, { status: 200 });
    } catch (error) {
        console.error({ err: error }, 'サイドメニューバー項目取得エラー');
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
