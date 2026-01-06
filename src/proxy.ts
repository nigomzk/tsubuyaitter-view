import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/lib/logger/pino';

/**
 * リクエストヘッダーに requestId を付与する
 * @param request リクエスト
 * @returns レスポンス
 */
export function proxy(request: NextRequest) {
    const requestId = uuidv4();
    logger.info({ requestId }, `[Middleware] Processing request: ${request.nextUrl.pathname}`);
    const response = NextResponse.next();
    response.headers.set('x-request-id', requestId);

    return response;
}