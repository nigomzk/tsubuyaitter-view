'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * 認証コード入力画面
 * @returns 
 */
export default function InputAuthcode() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [authcode, setAuthcode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const storedEmail = sessionStorage.getItem('signup_email');
        if (!storedEmail) {
            router.push('/signup');
        } else {
            setEmail(storedEmail);
        }
    }, [router]);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Client validation
        if (!authcode || !/^\d{6}$/.test(authcode)) {
            setError('6桁の数字を入力してください。');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/verify-authcode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, authcode }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || '認証に失敗しました。');
            } else {
                // Success: Save authcode to session as verified proof (needed for signup API)
                sessionStorage.setItem('signup_authcode', authcode);
                router.push('/signup/password');
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
                <button
                    onClick={() => router.back()}
                    style={{ position: 'absolute', top: '2rem', left: '1rem', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '1rem' }}
                >
                    &lt; 戻る
                </button>

                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold">認証コードを入力</h1>
                </div>

                <div className="mb-4">
                    <p className="text-sm text-secondary">
                        メールアドレスを認証するため、以下に認証コードを入力してください。<br />
                        <b>{email}</b>
                    </p>
                </div>

                <form onSubmit={handleVerify}>
                    <div className="input-group">
                        <label className="input-label">認証コード</label>
                        <input
                            type="text"
                            className="input-field"
                            value={authcode}
                            onChange={(e) => setAuthcode(e.target.value)}
                            required
                            maxLength={6}
                            placeholder="123456"
                        />
                    </div>

                    {error && (
                        <div className="text-error mb-4 text-center">
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? '認証中...' : '次へ'}
                    </button>
                </form>
            </div>
        </div>
    );
}
