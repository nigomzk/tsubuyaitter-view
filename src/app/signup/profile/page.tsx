'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/logger/pino';

/**
 * プロフィール設定画面
 */
export default function SetProfile() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) {
            setFile(f);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(f);
        }
    };

    const handleSave = async () => {
        if (!file) return;
        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/users/me/image', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.message || 'アップロードに失敗しました。');
            } else {
                router.push('/home');
            }
        } catch (err) {
            setError('通信エラーが発生しました。');
            logger.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = () => {
        router.push('/home');
    };

    return (
        <div className="grid place-items-center h-screen">
            <div className="container form">
                <div className="mb-4 text-center">
                    <h1 className="text-2xl font-bold">プロフィール画像を選択</h1>
                </div>

                <div className="flex justify-center mb-2">
                    <div className="w-[140px] h-[140px] rounded-full overflow-hidden relative bg-[#333]">
                        {preview ? (
                            <img src={preview} alt="Profile Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-secondary" >
                                No Image
                            </div>
                        )}
                    </div>
                </div>

                <div className="input-group text-center">
                    <label className="btn btn-secondary inline-flex w-auto cursor-pointer">
                        画像を選択
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                </div>

                {error && (
                    <div className="text-error mb-2 text-center">
                        {error}
                    </div>
                )}

                <button onClick={handleSave} className="btn btn-primary mb-2" disabled={!file || loading}>
                    {loading ? '保存中...' : '次へ'}
                </button>

                <button onClick={handleSkip} className="btn" disabled={loading}>
                    今はしない
                </button>
            </div>
        </div>
    );
}
