import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import prisma from '@/lib/prisma/client';
import redis from '@/lib/redis/client';
import { logger } from '@/lib/logger/pino';
import { CACHED_KEY } from '@/constants';

/**
 * つぶやき投稿API
 * @param req リクエスト
 * @returns レスポンス
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ code: "1", message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { content } = body;

        if (!content || content.length === 0 || content.length > 280) {
            return NextResponse.json({ code: "1", message: 'Invalid content length' }, { status: 400 });
        }

        const tweet = await prisma.post.create({
            data: {
                userId: session.id,
                content,
            }
        });

        // キャッシュDB更新
        await redis.lpush(CACHED_KEY.TWEETS, tweet.id);
        const tweetCount = await redis.llen(CACHED_KEY.TWEETS);
        // 10件以上になった場合は、古い投稿を削除
        if (tweetCount > 10) {
            await redis.rpop(CACHED_KEY.TWEETS);
        }

        // レスポンスに設定するためのユーザー情報取得
        const user = await prisma.user.findUnique({ where: { id: session.id } });

        return NextResponse.json({
            code: "0",
            message: 'Tweet posted',
            data: {
                post_id: tweet.id,
                username: user?.username,
                display_name: user?.displayName,
                profile_image_url: user?.profileImageUrl,
                content: tweet.content,
                created_at: tweet.createdAt,
            }
        });

    } catch (error) {
        logger.error('つぶやき投稿エラー:' + error);
        return NextResponse.json({ code: "9", message: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * タイムライン取得API
 * @param req リクエスト
 * @returns レスポンス
 */
export async function GET(req: NextRequest) {
    try {
        // キャッシュDBから呟きIDリストを取得
        let results = await redis.lrange(CACHED_KEY.TWEETS, 0, -1);
        // キャッシュDBに呟きIDリストが存在する場合
        if (results && results.length > 0) {
            let tweet_ids = results.map(results => parseInt(results));
            let tweets = await prisma.post.findMany({
                where: {
                    id: {
                        in: tweet_ids
                    }
                },
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            username: true,
                            displayName: true,
                            profileImageUrl: true,
                        }
                    }
                }
            });
            const data = tweets.map(t => ({
                post_id: t.id,
                username: t.user.username,
                display_name: t.user.displayName,
                profile_image_url: t.user.profileImageUrl,
                content: t.content,
                created_at: t.createdAt,
            }));
            return NextResponse.json({ code: "0", message: 'Timeline retrieved', data });
        }
        // キャッシュDBに呟きIDリストが存在しない場合
        const tweets = await prisma.post.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        username: true,
                        displayName: true,
                        profileImageUrl: true,
                    }
                }
            }
        });

        // キャッシュDBに呟きIDリストを保存
        await redis.del(CACHED_KEY.TWEETS);
        await redis.lpush(CACHED_KEY.TWEETS, ...tweets.map(t => t.id));
        const data = tweets.map(t => ({
            post_id: t.id,
            username: t.user.username,
            display_name: t.user.displayName,
            profile_image_url: t.user.profileImageUrl,
            content: t.content,
            created_at: t.createdAt,
        }));

        return NextResponse.json({ code: "0", message: 'Timeline retrieved', data });

    } catch (error) {
        console.error('タイムライン取得エラー:', error);
        return NextResponse.json({ code: "9", message: 'Internal Server Error' }, { status: 500 });
    }
}
