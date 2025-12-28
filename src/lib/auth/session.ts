import { cookies } from 'next/headers';
import { verifyToken } from './token';
import { UserSession } from '@/types';

export async function getSession(): Promise<UserSession | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return null;

    const payload = await verifyToken(token);
    if (!payload) return null;

    return payload as unknown as UserSession;
}
