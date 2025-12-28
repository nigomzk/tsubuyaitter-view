import Sidebar from '@/components/sidebar/Sidebar';

export default function HomeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-screen w-full h-svh">
            <div className="flex justify-center mx-auto">
                {/* 左側: サイドバー */}
                <Sidebar />

                {/* 中央: メインコンテンツ (タイムライン等) */}
                <main className="flex-auto w-full max-w-[600px] border-r border-gray-200 bg-white">
                    {children}
                </main>

                {/* 右側: おすすめユーザー / トレンド (将来用) */}
                <aside className="hidden lg:block w-[350px] min-h-screen overflow-y-hidden border-l border-gray-100/50">
                    <div className="bg-gray-50 rounded-2xl p-4 m-4">
                        <h2 className="font-bold text-xl mb-4">いまどうしてる？</h2>
                        <p className="text-gray-500">トレンドなどのコンテンツをここに配置予定です。</p>
                    </div>
                </aside>
            </div>
        </div>
    );
}
