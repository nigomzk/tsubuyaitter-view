import 'dotenv/config'
import type { SidebarMenuItemCreateInput } from './generated/models/SidebarMenuItem';
import prisma from './client';

/**
 * 初期データを投入する
 */
async function main() {
    console.log('Seeding started...');
    const sidebar_menu_items: SidebarMenuItemCreateInput[] = [
        {
            id: 1,
            icon: 'material-symbols:home',
            text: 'ホーム',
            destination: '/home',
            displayOrder: 10,
        },
        // 将来的に実装する
        // {
        //     id: 2,
        //     icon: 'material-symbols:search',
        //     text: '話題を検索',
        //     destination: '/explore',
        //     displayOrder: 20,
        // },
        // {
        //     id: 3,
        //     icon: 'material-symbols:notifications',
        //     text: '通知',
        //     destination: '/notifications',
        //     displayOrder: 30,
        // },
        // {
        //     id: 4,
        //     icon: 'material-symbols:mail',
        //     text: 'メッセージ',
        //     destination: '/messages',
        //     displayOrder: 40,
        // },
        // {
        //     id: 5,
        //     icon: 'material-symbols:person',
        //     text: 'プロフィール',
        //     destination: '/profile',
        //     displayOrder: 50,
        // },
    ];

    for (const item of sidebar_menu_items) {
        await prisma.sidebarMenuItem.upsert({
            where: {
                id: item.id,
            },
            update: {
                icon: item.icon,
                text: item.text,
                destination: item.destination,
                displayOrder: item.displayOrder,
            },
            create: item,
        });
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
