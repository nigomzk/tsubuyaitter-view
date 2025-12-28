/**
 * メールアドレス入力チェック
 * @param email メールアドレス
 * @returns True/False
 */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !(!email || !emailRegex.test(email) || email.length > 255)
};

/**
 * パスワード入力チェック
 * @param password パスワード
 * @returns True/False
 */
export const isValidPassword = (password: string): boolean => {
    // MVPのため、文字数チェックのみ
    // @TODO: 一般的なポリシーを考慮して実装する
    return !(!password || password.length < 8);
};

/**
 * ユーザー名入力チェック
 * @param username ユーザー名
 * @returns True/False
 */
export const isValidUsername = (username: string): boolean => {
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    return !(!username || username.length < 3 || username.length > 15 || !usernameRegex.test(username));
};
