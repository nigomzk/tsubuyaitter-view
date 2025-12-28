/**
 * 日時文字列を yyyy/mm/dd hh:mm:ss 形式にフォーマットする
 * @param dateString ISO形式などの日時文字列
 * @returns フォーマットされた日時文字列
 */
export const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${y}/${m}/${d} ${hh}:${mm}:${ss}`;
};
