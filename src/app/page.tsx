import Link from "next/link";
import { Icon } from '@iconify/react';

/**
 * トップ画面
 */
export default function Top() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8">
      <div className="w-[100px] h-[100px] relative">
        <Icon icon="basil:comment-solid" width="80" height="80" className="text-[var(--color-primary)]" />
      </div>

      <h1 className="text-5xl text-main font-bold">すべての話題が、ここに！</h1>

      <div className="flex flex-col gap-4 w-full max-w-[300px]">
        <h2 className="text-2xl text-main font-bold mb-4">今すぐ参加しましょう。</h2>

        <Link href="/signup" className="btn btn-primary">
          アカウントを作成
        </Link>

        <div className="mt-4 text-center">
          <p className="text-sm text-secondary">
            アカウントをお持ちの場合
          </p>
        </div>

        <Link href="/login" className="btn btn-secondary">
          ログイン
        </Link>
      </div>
    </div>
  );
}
