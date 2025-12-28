'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * サインアップ確認画面
 */
export default function SignupConfirm() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const storedName = sessionStorage.getItem('signup_name');
        const storedEmail = sessionStorage.getItem('signup_email');

        if (!storedName || !storedEmail) {
            // session にデータがない場合はサインアップ画面に戻す
            router.push('/signup');
        } else {
            setName(storedName);
            setEmail(storedEmail);
        }
    }, [router]);

    const handleRegister = async () => {
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/send-authcode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, display_name: name }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || '認証コードの送信に失敗しました。');
            } else {
                router.push('/signup/verify');
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
                <div className="relative flex items-center justify-center mb-4">
                    <button
                        onClick={() => router.back()}
                        className="absolute left-0 bg-transparent border-none text-primary cursor-pointer text-base"
                    >
                        &lt; 戻る
                    </button>
                    <h1 className="text-2xl font-bold">アカウントを作成</h1>
                </div>

                <div className="input-group">
                    <label className="input-label">名前</label>
                    <input type="text" className="input-field" value={name} disabled />
                </div>

                <div className="input-group">
                    <label className="input-label">メールアドレス</label>
                    <input type="text" className="input-field" value={email} disabled />
                </div>

                {error && (
                    <div className="text-error mb-2 text-center">
                        {error}
                    </div>
                )}

                <div className="mt-4 text-center">
                    <p className="text-sm text-secondary mb-2">
                        次へ進むと、確認コードがあなたのメールアドレスに送信されます。
                    </p>
                    <button onClick={handleRegister} className="btn btn-primary" disabled={loading}>
                        {loading ? '送信中...' : '次へ'}
                    </button>
                </div>
            </div>
        </div>
    );
}
