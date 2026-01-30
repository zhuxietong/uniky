// uniKy.ts
// 创建一个基础类实现所有方法
class UniKyBase {
    constructor(options = {}) {
        this.defaultOptions = {
            prefixUrl: '',
            timeout: 60000,
            headers: {},
            retry: 0,
            hooks: {
                beforeRequest: [],
                afterResponse: [],
            },
            ...options,
        };
    }
    async request(url, options = {}) {
        const mergedOptions = this.mergeOptions(options);
        const fullUrl = this.getFullUrl(url, mergedOptions);
        // 如果有 hud，则调用 start 方法
        if (mergedOptions.hud) {
            mergedOptions.hud.start();
        }
        // 创建请求对象
        let request = {
            url: fullUrl,
            method: (options.method || 'GET').toUpperCase(),
            headers: mergedOptions.headers || {},
            body: options.data,
            timeout: mergedOptions.timeout,
        };
        // 执行请求前拦截器
        if (mergedOptions.hooks?.beforeRequest?.length) {
            for (const hook of mergedOptions.hooks.beforeRequest) {
                const result = await hook(request, mergedOptions);
                // 如果拦截器返回了新的请求对象，则使用它
                if (result !== undefined && result !== null) {
                    request = result;
                }
                // 如果拦截器没有返回值(void)，则继续使用当前的请求对象
            }
        }
        // 转换为 uni.request 需要的格式
        const requestOptions = {
            url: request.url,
            method: request.method,
            header: request.headers,
            data: request.body,
            timeout: request.timeout,
        };
        try {
            let retries = mergedOptions.retry || 0;
            let response;
            while (true) {
                try {
                    response = await this.makeRequest(requestOptions, request.url);
                    break;
                }
                catch (error) {
                    if (retries <= 0) {
                        // 如果是请求失败（网络错误等），直接使用错误对象
                        response = error;
                        break;
                    }
                    retries--;
                }
            }
            // 无论成功还是HTTP错误（如404），都执行响应后拦截器
            if (mergedOptions.hooks?.afterResponse?.length) {
                let processedResponse = response;
                for (const hook of mergedOptions.hooks.afterResponse) {
                    const result = await hook(processedResponse, request, mergedOptions);
                    // 如果拦截器返回了新的响应对象，则使用它
                    if (result !== undefined && result !== null) {
                        processedResponse = result;
                    }
                }
                // 只在这里调用一次 hud.end
                if (mergedOptions.hud) {
                    mergedOptions.hud.end(processedResponse.ok, !processedResponse.ok ? processedResponse : undefined);
                }
                // 如果是HTTP错误且没有被拦截器处理成功响应，则抛出
                if (!processedResponse.ok) {
                    throw processedResponse;
                }
                return processedResponse.data;
            }
            // 只在这里调用一次 hud.end
            if (mergedOptions.hud) {
                mergedOptions.hud.end(response.ok, !response.ok ? response : undefined);
            }
            // 如果没有拦截器但有HTTP错误，抛出
            if (!response.ok) {
                throw response;
            }
            return response.data;
        }
        catch (error) {
            // 移除这里的 hud.end 调用，因为已经在上面调用过了
            // 如果是网络错误等未捕获的异常，才在这里调用 hud.end
            if (mergedOptions.hud && !error.statusCode) {
                mergedOptions.hud.end(false, error);
            }
            throw error;
        }
    }
    makeRequest(options, originalUrl) {
        return new Promise((resolve, reject) => {
            uni.request({
                ...options,
                success: (res) => {
                    const response = {
                        data: res.data,
                        statusCode: res.statusCode,
                        header: res.header,
                        cookies: res.cookies || [],
                        ok: res.statusCode >= 200 && res.statusCode < 300,
                        redirected: res.statusCode === 301 || res.statusCode === 302,
                        url: originalUrl,
                    };
                    // 处理非2xx状态码
                    if (response.ok) {
                        resolve(response);
                    }
                    else {
                        reject(response);
                    }
                },
                fail: (err) => {
                    reject({
                        ...err,
                        ok: false,
                        statusCode: 0,
                        header: {},
                        cookies: [],
                        redirected: false,
                        url: originalUrl,
                        data: null,
                    });
                },
            });
        });
    }
    mergeOptions(options) {
        // 创建新的 hooks 对象，确保不修改原始对象
        const mergedHooks = {
            beforeRequest: [...(this.defaultOptions.hooks?.beforeRequest || [])],
            afterResponse: [...(this.defaultOptions.hooks?.afterResponse || [])],
        };
        // 添加传入的 hooks
        if (options.hooks?.beforeRequest) {
            if (Array.isArray(options.hooks.beforeRequest)) {
                mergedHooks.beforeRequest.push(...options.hooks.beforeRequest);
            }
            else {
                // 如果不是数组，转换为数组
                mergedHooks.beforeRequest.push(options.hooks.beforeRequest);
            }
        }
        if (options.hooks?.afterResponse) {
            if (Array.isArray(options.hooks.afterResponse)) {
                mergedHooks.afterResponse.push(...options.hooks.afterResponse);
            }
            else {
                // 如果不是数组，转换为数组
                mergedHooks.afterResponse.push(options.hooks.afterResponse);
            }
        }
        return {
            ...this.defaultOptions,
            ...options,
            headers: {
                ...this.defaultOptions.headers,
                ...options.headers,
            },
            hooks: mergedHooks,
        };
    }
    addSearchParams(url, searchParams) {
        if (!searchParams) {
            return url;
        }
        // 准备查询字符串
        let queryString = '';
        if (typeof searchParams === 'string') {
            // 如果是字符串，直接使用
            queryString = searchParams.startsWith('?') ? searchParams.substring(1) : searchParams;
        }
        else if (typeof URLSearchParams !== 'undefined' && searchParams instanceof URLSearchParams) {
            // 如果是 URLSearchParams 实例，转为字符串
            queryString = searchParams.toString();
        }
        else if (searchParams && typeof searchParams === 'object') {
            // 如果是对象，手动构建查询字符串
            const params = [];
            for (const [key, value] of Object.entries(searchParams)) {
                if (value !== undefined && value !== null) {
                    // @ts-ignore
                    params.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
                }
            }
            queryString = params.join('&');
        }
        // 添加到 URL
        const hasQueryString = url.includes('?');
        if (queryString) {
            return url + (hasQueryString ? '&' : '?') + queryString;
        }
        return url;
    }
    getFullUrl(url, options) {
        const prefixUrl = options.prefixUrl ? options.prefixUrl.replace(/\/$/, '') : '';
        // 首先判断是否是完整URL
        if (url.startsWith('http://') || url.startsWith('https://')) {
            // 对完整URL添加查询参数
            return this.addSearchParams(url, options.searchParams);
        }
        // 处理相对路径
        const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
        const fullUrl = `${prefixUrl}${normalizedUrl}`;
        // 添加查询参数
        return this.addSearchParams(fullUrl, options.searchParams);
    }
    // 创建具有 json 方法的 Promise
    createUniKyPromise(promise) {
        const uniKyPromise = promise;
        uniKyPromise.json = function () {
            return this.then((data) => {
                if (typeof data === 'string') {
                    try {
                        return JSON.parse(data);
                    }
                    catch (e) {
                        return data;
                    }
                }
                return data;
            });
        };
        return uniKyPromise;
    }
    get(url, options = {}) {
        return this.createUniKyPromise(this.request(url, { ...options, method: 'GET' }));
    }
    post(url, options = {}) {
        return this.createUniKyPromise(this.request(url, { ...options, method: 'POST' }));
    }
    put(url, options = {}) {
        return this.createUniKyPromise(this.request(url, { ...options, method: 'PUT' }));
    }
    delete(url, options = {}) {
        return this.createUniKyPromise(this.request(url, { ...options, method: 'DELETE' }));
    }
    patch(url, options = {}) {
        return this.createUniKyPromise(this.request(url, { ...options, method: 'PATCH' }));
    }
    head(url, options = {}) {
        return this.createUniKyPromise(this.request(url, { ...options, method: 'HEAD' }));
    }
    options(url, options = {}) {
        return this.createUniKyPromise(this.request(url, { ...options, method: 'OPTIONS' }));
    }
}
// 使用函数工厂模式创建符合 UniKyInstance 接口的实例
function createUniKy(defaultOptions = {}) {
    const base = new UniKyBase(defaultOptions);
    // 创建主函数
    const uniKyFunction = (url, options = {}) => {
        return base['createUniKyPromise'](base['request'](url, options));
    };
    // 添加所有方法
    uniKyFunction.get = base.get.bind(base);
    uniKyFunction.post = base.post.bind(base);
    uniKyFunction.put = base.put.bind(base);
    uniKyFunction.delete = base.delete.bind(base);
    uniKyFunction.patch = base.patch.bind(base);
    uniKyFunction.head = base.head.bind(base);
    uniKyFunction.options = base.options.bind(base);
    // 添加 create 方法
    uniKyFunction.create = (options) => {
        // 深度合并 hooks
        const mergedHooks = {
            beforeRequest: [...(defaultOptions.hooks?.beforeRequest || [])],
            afterResponse: [...(defaultOptions.hooks?.afterResponse || [])],
        };
        // 添加传入的 hooks
        if (options.hooks?.beforeRequest) {
            if (Array.isArray(options.hooks.beforeRequest)) {
                mergedHooks.beforeRequest.push(...options.hooks.beforeRequest);
            }
            else {
                // 如果不是数组，转换为数组
                mergedHooks.beforeRequest.push(options.hooks.beforeRequest);
            }
        }
        if (options.hooks?.afterResponse) {
            if (Array.isArray(options.hooks.afterResponse)) {
                mergedHooks.afterResponse.push(...options.hooks.afterResponse);
            }
            else {
                // 如果不是数组，转换为数组
                mergedHooks.afterResponse.push(options.hooks.afterResponse);
            }
        }
        return createUniKy({
            ...defaultOptions,
            ...options,
            hooks: mergedHooks,
            headers: {
                ...defaultOptions.headers,
                ...options.headers,
            },
        });
    };
    // 添加 extend 方法
    uniKyFunction.extend = (options) => {
        return uniKyFunction.create(options);
    };
    return uniKyFunction;
}
// 默认导出实例
export const uniKy = createUniKy();
//# sourceMappingURL=ky.js.map