import type { AsyncLocalStorage as AsyncLocalStorageType } from 'async_hooks';

// リクエストごとの情報を入れる型定義
export interface RequestContext {
    requestId: string;
}
// サーバーサイド（Node.js）でのみインスタンス化を許可する
const globalForContext = global as unknown as {
    // requestContext: AsyncLocalStorage<RequestContext>;
    requestContext: AsyncLocalStorageType<RequestContext>;
};

let requestContext: AsyncLocalStorageType<RequestContext> | null = null;

// サーバーサイド（Node.js環境）のみ実行
if (typeof window === 'undefined') {
    // require を使うことで Turbopack の静的解析を回避し、実行時に Node.js から読み込ませる
    const { AsyncLocalStorage } = require('async_hooks');

    if (!globalForContext.requestContext) {
        globalForContext.requestContext = new AsyncLocalStorage();
    }
    requestContext = globalForContext.requestContext;
}

export { requestContext };