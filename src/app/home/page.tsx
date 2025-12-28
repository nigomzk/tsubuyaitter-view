'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDateTime } from '@/lib/utils/date';

type User = {
    id: number;
    username: string;
    display_name: string;
    profile_image_url?: string;
};

type Tweet = {
    post_id: number;
    username: string;
    display_name: string;
    profile_image_url?: string;
    content: string;
    created_at: string;
};

/**
 * ホーム画面
 * @returns 
 */
export default function Home() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [tweets, setTweets] = useState<Tweet[]>([]);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        try {
            const res = await fetch('/api/users/me');
            if (res.ok) {
                const json = await res.json();
                setUser(json.data);
            } else {
                router.push('/login');
            }
        } catch (e) {
            console.error(e);
            router.push('/login');
        }
    };

    const fetchTweets = async () => {
        try {
            const res = await fetch('/api/tweets');
            if (res.ok) {
                const json = await res.json();
                setTweets(json.data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        Promise.all([fetchUser(), fetchTweets()]).finally(() => setLoading(false));
    }, []);

    const handlePost = async () => {
        if (!content.trim()) return;
        try {
            const res = await fetch('/api/tweets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content }),
            });
            if (res.ok) {
                setContent('');
                fetchTweets();
            } else {
                alert('ツイートに失敗しました');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="container min-h-screen pb-8">
            {/* Header */}
            <header className="py-4 flex justify-between items-center border-b border-[var(--color-background)] sticky top-0 z-10">
                <h1 className="text-[1.2rem] text-main font-bold">ホーム</h1>
                <div className="flex items-center gap-4">
                    {/* User Icon / Dropdown placeholder */}
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-[#333]">
                        {user?.profile_image_url ? (
                            <img src={user.profile_image_url} alt={user.username} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px]">
                                {user?.display_name?.[0] || 'U'}
                            </div>
                        )}
                    </div>
                    <button onClick={handleLogout} className="bg-none border-none text-main cursor-pointer text-xs px-2">
                        ログアウト
                    </button>
                </div>
            </header>

            {/* Tweet Input */}
            <div className="py-4 border-b border-[var(--color-background)]">
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-[#333] shrink-0">
                        {user?.profile_image_url ? (
                            <img src={user.profile_image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                {user?.display_name?.[0]}
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="いまどうしてる？"
                            className="w-full bg-transparent border-none text-main text-[1.2rem] font-inherit resize-none outline-none min-h-[80px]"
                        />
                        <div className="flex justify-end mt-2">
                            <button
                                onClick={handlePost}
                                className="btn-primary font-bold w-auto px-6 h-9 disabled:opacity-50"
                                disabled={!content.trim()}
                            >
                                つぶやく
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className="timeline">
                {tweets.map((tweet) => (
                    <div key={tweet.post_id} className="py-4 border-b border-[var(--color-background)] flex gap-4 cursor-pointer transition-[background] duration-200 hover:bg-white/5">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-[#333] shrink-0">
                            {tweet.profile_image_url ? (
                                <img src={tweet.profile_image_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    {tweet.display_name?.[0]}
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex gap-2 items-center mb-1">
                                <span className="font-bold">{tweet.display_name}</span>
                                <span className="text-secondary text-sm">@{tweet.username}</span>
                                <span className="text-secondary text-sm">· {formatDateTime(tweet.created_at)}</span>
                            </div>
                            <p className="leading-relaxed">
                                {tweet.content}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
