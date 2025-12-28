'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isValidEmail } from '@/lib/validation';

/**
 * サインアップ画面
 */
export default function Signup() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // 入力チェック
        if (!name || name.length > 50) {
            setError('名前は50文字以内で入力してください。');
            return;
        }
        if (!isValidEmail(email)) {
            setError('有効なメールアドレスを入力してください。');
            return;
        }

        // session storageに保存
        sessionStorage.setItem('signup_name', name);
        sessionStorage.setItem('signup_email', email);

        // 次へ
        router.push('/signup/confirm');
    };

    return (
        <div className="grid place-items-center h-screen">
            <div className="container form">
                <div className="mb-4 text-center">
                    <h1 className="text-2xl text-main font-bold">アカウントを作成</h1>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">名前</label>
                        <input
                            type="text"
                            className="input-field"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="表示名を入力"
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">メールアドレス</label>
                        <input
                            type="email"
                            className="input-field"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="example@mail.com"
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

                <div className="mt-4 text-center">
                    <p className="text-sm text-secondary">
                        アカウントをお持ちの場合 <Link href="/login" className="text-primary">ログイン</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
