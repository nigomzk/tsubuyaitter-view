'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isValidUsername } from '@/lib/validation';
import { logger } from '@/lib/logger/pino'

/**
 * ユーザー名設定画面
 */
export default function SetUsername() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [available, setAvailable] = useState<boolean | null>(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Session data
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [authcode, setAuthcode] = useState('');

    useEffect(() => {
        const storedEmail = sessionStorage.getItem('signup_email');
        const storedPassword = sessionStorage.getItem('signup_password');
        const storedAuthCode = sessionStorage.getItem('signup_authcode');

        if (!storedEmail || !storedPassword || !storedAuthCode) {
            // session にデータがない場合はサインアップ画面に戻す
            router.push('/signup');
        } else {
            setEmail(storedEmail);
            setPassword(storedPassword);
            setAuthcode(storedAuthCode);
        }
    }, [router]);

    const checkAvailability = async (val: string) => {
        if (!val) {
            setAvailable(null);
            setMessage('');
            return;
        }
        // 入力チェック
        if (!isValidUsername(val)) {
            setAvailable(false);
            setMessage('半角英数字アンダースコア 3-15文字で入力してください。');
            return;
        }

        try {
            const res = await fetch('/api/user/validate-unique-username', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: val }),
            });
            const data = await res.json();
            if (data.is_unique) {
                setAvailable(true);
                setMessage('利用可能なユーザー名です。');
            } else {
                setAvailable(false);
                setMessage('利用できないユーザー名です。');
            }
        } catch (e) {
            logger.error(e);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setUsername(val);
        // @TODO: 今後ブラー処理かデバウンス処理付きのエフェクト処理に決める
    };

    // でバウンスチェック
    useEffect(() => {
        const timer = setTimeout(() => {
            checkAvailability(username);
        }, 500);
        return () => clearTimeout(timer);
    }, [username]);

    const handleNext = async () => {
        if (!available) return;
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    username,
                    authcode
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'アカウント作成に失敗しました。');
            } else {
                // session内の機密情報を削除
                sessionStorage.removeItem('signup_password');
                sessionStorage.removeItem('signup_authcode');
                router.push('/signup/profile');
            }
        } catch (err) {
            setError('通信エラーが発生しました。');
            logger.error(err);
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
                    <h1 className="text-2xl font-bold">ユーザー名を入力</h1>
                </div>

                <div className="mb-2 text-center">
                    <p className="text-sm text-secondary mb-2">
                        Tsubuyaitterで使われるアドレスです。<br />半角英数字アンダースコア (3-15文字) のみ使用できます。
                    </p>
                </div>

                <div className="input-group">
                    <label className="input-label">ユーザー名</label>
                    <input
                        type="text"
                        className={`input-field ${available === false ? 'border-error' : available === true ? 'border-success' : ''}`}
                        value={username}
                        onChange={handleChange}
                        required
                        placeholder="username"
                    />
                    {message && (
                        <p className={`text-xs text-secondary mt-2 ${available === false ? 'text-error' : 'text-success'}`}>
                            {message}
                        </p>
                    )}
                </div>

                {error && (
                    <div className="text-error mb-2 text-center">
                        {error}
                    </div>
                )}

                <button onClick={handleNext} className="btn btn-primary" disabled={!available || loading}>
                    {loading ? '作成中...' : '次へ'}
                </button>
            </div>
        </div>
    );
}
