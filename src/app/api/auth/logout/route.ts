import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * ログアウトAPI
 * @returns レスポンス
 */
export async function POST() {
    const cookieStore = await cookies();
    cookieStore.delete('token');
    return NextResponse.json({ code: "0", message: 'ログアウトしました。' });
}
