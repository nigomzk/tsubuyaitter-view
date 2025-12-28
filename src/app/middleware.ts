import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

/**
 * リクエストヘッダーに requestId を付与する
 * @param request リクエスト
 * @returns レスポンス
 */
export function middleware(request: NextRequest) {
    const requestId = uuidv4();
    const response = NextResponse.next();
    response.headers.set('x-request-id', requestId);

    return response;
}