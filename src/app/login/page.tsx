'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

/**
 * ログイン画面
 * @returns 
 */
export default function Login() {
    const router = useRouter();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ identifier, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'ログインに失敗しました。');
            } else {
                // Success
                router.push('/home');
            }
        } catch (err) {
            setError('通信エラーが発生しました。');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid place-items-center h-screen">
            <div className="container form">
                <div className="mb-4 text-center">
                    <h1 className="text-2xl font-bold">Tsubuyaitterにログイン</h1>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">ユーザー名 または メールアドレス</label>
                        <input
                            type="text"
                            className="input-field"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">パスワード</label>
                        <input
                            type="password"
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    {error && (
                        <div className="text-error mb-2 text-center">
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'ログイン中...' : 'ログイン'}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <p className="text-sm text-secondary">
                        アカウントをお持ちでない場合 <Link href="/signup" className="text-primary">登録する</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
