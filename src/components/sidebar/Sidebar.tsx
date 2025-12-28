'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@iconify/react';

interface SidebarMenuItem {
    item_id: number;
    icon: string;
    text: string;
    destination: string;
}

/**
 * サイドバーコンポーネント
 * @returns 
 */
export default function Sidebar() {
    const pathname = usePathname();
    const [menuItems, setMenuItems] = useState<SidebarMenuItem[]>([
        {
            item_id: 1,
            icon: 'material-symbols:home',
            text: 'ホーム',
            destination: '/home',
        },
        {
            item_id: 2,
            icon: 'material-symbols:search',
            text: '話題を検索',
            destination: '/explore',
        },
        {
            item_id: 3,
            icon: 'material-symbols:notifications',
            text: '通知',
            destination: '/notifications',
        },
        {
            item_id: 4,
            icon: 'material-symbols:mail',
            text: 'メッセージ',
            destination: '/messages',
        },
        {
            item_id: 5,
            icon: 'material-symbols:person',
            text: 'プロフィール',
            destination: '/profile',
        },
    ]);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // サイドバーメニュー取得
        fetch('/api/sidebar-menu')
            .then((res) => res.json())
            .then((data) => {
                if (data.sidebar_menu) {
                    setMenuItems(data.sidebar_menu);
                }
            });

        // ユーザー情報取得 (簡易的に実装。本来はAuth Context等から取得)
        fetch('/api/user/profile')
            .then((res) => res.json())
            .then((data) => {
                if (data.user) {
                    setUser(data.user);
                }
            });
    }, []);

    return (
        <div className="sidebar hidden sm:block sm:min-w-[72px] xl:min-w-[276px] xl:items-start min-h-screen overflow-y-auto xl:px-4 py-2 border-r border-gray-200">
            {/* ロゴ */}
            <div className="mb-6 px-4">
                <Link href="/home">
                    <Icon icon="basil:comment-solid" width="24" height="24" className="mx-auto xl:mx-0 text-[var(--color-primary)]" />
                </Link>
            </div>

            {/* メニュー */}
            <nav className="flex-grow w-full">
                {menuItems.map((item) => {
                    const isActive = pathname === item.destination;
                    return (
                        <Link
                            key={item.item_id}
                            href={item.destination}
                            className={`flex items-center px-4 py-2 rounded-full transition-colors duration-200 hover:bg-gray-100 ${isActive ? 'font-bold' : ''
                                }`}
                        >
                            <Icon icon={item.icon} className="text-2xl mx-auto xl:mx-0" width="24" height="24" />
                            <span className="text-xl hidden xl:block px-4">{item.text}</span>
                        </Link>
                    );
                })}

                {/* つぶやきボタン */}
                <button className="btn-primary font-bold w-full mt-4 px-6 h-9">
                    つぶやく
                </button>
            </nav>

            {/* ミニプロファイル */}
            {user && (
                <div className="mt-auto flex items-center space-x-3 p-3 rounded-full hover:bg-gray-100 cursor-pointer transition-colors duration-200">
                    <img
                        src={user.profile_image_url || '/default-avatar.png'}
                        alt={user.display_name}
                        className="h-10 w-10 rounded-full border border-gray-100"
                    />
                    <div className="hidden lg:block overflow-hidden">
                        <p className="font-bold truncate text-sm">{user.display_name}</p>
                        <p className="text-gray-500 truncate text-xs">@{user.username}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
