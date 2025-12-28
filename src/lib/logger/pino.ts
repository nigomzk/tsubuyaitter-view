import pino from 'pino';
import { requestContext } from '@/lib/request/request_context';

// 実行環境判定
const isEdge = process.env.NEXT_RUNTIME === 'edge';
// ログレベルの取得
const logLevel = process.env.LOG_LEVEL || 'info';
// Docker Compose で設定した環境変数を取得
const logFilePath = process.env.LOG_OUTPUT;

/**
 * ログ出力先の設定
 */
// サーバーサイドでのみ使用する設定
let streams: pino.StreamEntry[] = [];
if (typeof window === 'undefined') {
    streams.push({ stream: process.stdout });
}

if (!isEdge && logFilePath) {
    streams.push({
        stream: pino.destination({
            dest: logFilePath,
            minLength: 0,    // 即時書き込み
            sync: true,      // 同期書き込み
            mkdir: true
        })
    });
}

/**
 * ログモジュール
 */
export const logger = pino(
    {
        // ログに出力する最低のログレベル
        level: logLevel,
        base: {
            env: process.env.NODE_ENV,
        },
        timestamp: pino.stdTimeFunctions.isoTime,
        mixin() {
            try {
                // requestContext はサーバーサイドのみ
                const store = (typeof window === 'undefined' && requestContext) ? requestContext.getStore() : null;
                return {
                    requestId: store?.requestId,
                };
            } catch (error) {
                return {};
            }
        },
    },
    // ブラウザ環境では multistream を使用しない
    (typeof window === 'undefined' && pino.multistream)
        ? pino.multistream(streams)
        : undefined
);