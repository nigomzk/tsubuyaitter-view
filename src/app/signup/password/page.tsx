'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isValidPassword } from '@/lib/validation';

/**
 * パスワード設定画面
 */
export default function SetPassword() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        // フローデータが検証されていることを確認する
        const storedAuthCode = sessionStorage.getItem('signup_authcode');
        if (!storedAuthCode) {
            router.push('/signup');
        }
    }, [router]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!isValidPassword(password)) {
            setError('パスワードは8文字以上にしてください。');
            return;
        }

        sessionStorage.setItem('signup_password', password);
        router.push('/signup/username');
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
                    <h1 className="text-2xl font-bold">パスワードを入力</h1>
                </div>

                <div className="mb-2">
                    <p className="text-sm text-secondary">
                        8文字以上にしてください。
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">パスワード</label>
                        <input
                            type="password"
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                            placeholder="パスワードを入力"
                        />
                    </div>

                    {error && (
                        <div className="text-error mb-2 text-center">
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary">
                        次へ
                    </button>
                </form>
            </div>
        </div>
    );
}
