export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface UserSession {
    id: number;
    username: string;
    email: string;
    iat: number;
    exp: number;
}
