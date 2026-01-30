export interface UniKyRequest {
    url: string;
    method: string;
    headers: Record<string, string>;
    body?: any;
    timeout?: number;
}
export interface ActiveHud {
    start(info?: any): void;
    end(success: boolean, message?: any): void;
}
export interface UniKyOptions {
    prefixUrl?: string;
    timeout?: number;
    headers?: Record<string, string>;
    retry?: number;
    method?: string;
    data?: any;
    searchParams?: Record<string, any> | URLSearchParams | string;
    hud?: ActiveHud;
    hooks?: {
        beforeRequest?: Array<(request: UniKyRequest, options: UniKyOptions) => UniKyRequest | void | Promise<UniKyRequest | void>>;
        afterResponse?: Array<(response: UniKyResponse, request: UniKyRequest, options: UniKyOptions) => any | void | Promise<any | void>>;
    };
    [key: string]: any;
}
export interface UniKyResponse<T = any> {
    data: T;
    statusCode: number;
    header: Record<string, string>;
    cookies: string[];
    ok: boolean;
    redirected: boolean;
    message?: string;
    url: string;
}
export interface UniKyPromise<T = any> extends Promise<T> {
    json<R = T>(): Promise<R>;
}
export interface UniKyInstance {
    <T = any>(url: string, options?: UniKyOptions): UniKyPromise<T>;
    get: <T = any>(url: string, options?: UniKyOptions) => UniKyPromise<T>;
    post: <T = any>(url: string, options?: UniKyOptions) => UniKyPromise<T>;
    put: <T = any>(url: string, options?: UniKyOptions) => UniKyPromise<T>;
    delete: <T = any>(url: string, options?: UniKyOptions) => UniKyPromise<T>;
    patch: <T = any>(url: string, options?: UniKyOptions) => UniKyPromise<T>;
    head: <T = any>(url: string, options?: UniKyOptions) => UniKyPromise<T>;
    options: <T = any>(url: string, options?: UniKyOptions) => UniKyPromise<T>;
    create: (defaultOptions: UniKyOptions) => UniKyInstance;
    extend: (options: UniKyOptions) => UniKyInstance;
}
export declare const uniKy: UniKyInstance;
//# sourceMappingURL=ky.d.ts.map