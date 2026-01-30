var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// src/lib/hook/useParam.ts
var useParam = (callBack) => {
  const { ref } = __require("vue");
  const { onLoad } = __require("@dcloudio/uni-app");
  const query = ref({});
  const json = ref({});
  const param = ref({});
  onLoad((op) => {
    let jsonObj = {};
    let queryObj = {};
    if (!op || Object.keys(op).length === 0) {
      param.value = {};
      query.value = {};
      json.value = {};
      callBack?.({ option: {}, query: {}, json: {} });
      return;
    }
    const decodedOp = {};
    for (const key in op) {
      if (typeof op[key] === "string") {
        if (key === "json") {
          try {
            decodedOp[key] = JSON.parse(decodeURIComponent(op[key]));
            jsonObj = decodedOp[key];
            json.value = jsonObj;
          } catch (e) {
          }
          continue;
        }
        decodedOp[key] = decodeURIComponent(op[key]);
      } else {
        decodedOp[key] = op[key];
      }
    }
    try {
      queryObj = { ...decodedOp };
      delete queryObj.json;
      query.value = queryObj;
    } catch (e) {
    }
    param.value = { ...jsonObj, ...queryObj };
    callBack?.({ option: param.value, query: query.value, json: json.value });
  });
  return {
    query,
    param,
    json
  };
};
var useMountedLoad = (callBack) => {
  const { ref, onMounted } = __require("vue");
  const { onLoad } = __require("@dcloudio/uni-app");
  const query = ref({});
  const json = ref({});
  const param = ref({});
  onLoad((op) => {
    let jsonObj = {};
    let queryObj = {};
    if (!op || Object.keys(op).length === 0) {
      param.value = {};
      query.value = {};
      json.value = {};
      return;
    }
    const decodedOp = {};
    for (const key in op) {
      if (typeof op[key] === "string") {
        if (key === "json") {
          try {
            decodedOp[key] = JSON.parse(decodeURIComponent(op[key]));
            jsonObj = decodedOp[key];
            json.value = jsonObj;
          } catch (e) {
          }
          continue;
        }
        decodedOp[key] = decodeURIComponent(op[key]);
      } else {
        decodedOp[key] = op[key];
      }
    }
    try {
      queryObj = { ...decodedOp };
      delete queryObj.json;
      query.value = queryObj;
    } catch (e) {
    }
    param.value = { ...jsonObj, ...queryObj };
  });
  onMounted(() => {
    callBack?.({
      option: param.value || {},
      query: query.value || {},
      json: json.value || {}
    });
  });
  return {
    query,
    param,
    json
  };
};

// src/lib/http/ky.ts
var UniKyBase = class {
  constructor(options = {}) {
    this.defaultOptions = {
      prefixUrl: "",
      timeout: 6e4,
      headers: {},
      retry: 0,
      hooks: {
        beforeRequest: [],
        afterResponse: []
      },
      ...options
    };
  }
  async request(url, options = {}) {
    const mergedOptions = this.mergeOptions(options);
    const fullUrl = this.getFullUrl(url, mergedOptions);
    if (mergedOptions.hud) {
      mergedOptions.hud.start();
    }
    let request = {
      url: fullUrl,
      method: (options.method || "GET").toUpperCase(),
      headers: mergedOptions.headers || {},
      body: options.data,
      timeout: mergedOptions.timeout
    };
    if (mergedOptions.hooks?.beforeRequest?.length) {
      for (const hook of mergedOptions.hooks.beforeRequest) {
        const result = await hook(request, mergedOptions);
        if (result !== void 0 && result !== null) {
          request = result;
        }
      }
    }
    const requestOptions = {
      url: request.url,
      method: request.method,
      header: request.headers,
      data: request.body,
      timeout: request.timeout
    };
    try {
      let retries = mergedOptions.retry || 0;
      let response;
      while (true) {
        try {
          response = await this.makeRequest(requestOptions, request.url);
          break;
        } catch (error) {
          if (retries <= 0) {
            response = error;
            break;
          }
          retries--;
        }
      }
      if (mergedOptions.hooks?.afterResponse?.length) {
        let processedResponse = response;
        for (const hook of mergedOptions.hooks.afterResponse) {
          const result = await hook(processedResponse, request, mergedOptions);
          if (result !== void 0 && result !== null) {
            processedResponse = result;
          }
        }
        if (mergedOptions.hud) {
          mergedOptions.hud.end(
            processedResponse.ok,
            !processedResponse.ok ? processedResponse : void 0
          );
        }
        if (!processedResponse.ok) {
          throw processedResponse;
        }
        return processedResponse.data;
      }
      if (mergedOptions.hud) {
        mergedOptions.hud.end(response.ok, !response.ok ? response : void 0);
      }
      if (!response.ok) {
        throw response;
      }
      return response.data;
    } catch (error) {
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
            url: originalUrl
          };
          if (response.ok) {
            resolve(response);
          } else {
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
            data: null
          });
        }
      });
    });
  }
  mergeOptions(options) {
    const mergedHooks = {
      beforeRequest: [...this.defaultOptions.hooks?.beforeRequest || []],
      afterResponse: [...this.defaultOptions.hooks?.afterResponse || []]
    };
    if (options.hooks?.beforeRequest) {
      if (Array.isArray(options.hooks.beforeRequest)) {
        mergedHooks.beforeRequest.push(...options.hooks.beforeRequest);
      } else {
        mergedHooks.beforeRequest.push(options.hooks.beforeRequest);
      }
    }
    if (options.hooks?.afterResponse) {
      if (Array.isArray(options.hooks.afterResponse)) {
        mergedHooks.afterResponse.push(...options.hooks.afterResponse);
      } else {
        mergedHooks.afterResponse.push(options.hooks.afterResponse);
      }
    }
    return {
      ...this.defaultOptions,
      ...options,
      headers: {
        ...this.defaultOptions.headers,
        ...options.headers
      },
      hooks: mergedHooks
    };
  }
  addSearchParams(url, searchParams) {
    if (!searchParams) {
      return url;
    }
    let queryString = "";
    if (typeof searchParams === "string") {
      queryString = searchParams.startsWith("?") ? searchParams.substring(1) : searchParams;
    } else if (typeof URLSearchParams !== "undefined" && searchParams instanceof URLSearchParams) {
      queryString = searchParams.toString();
    } else if (searchParams && typeof searchParams === "object") {
      const params = [];
      for (const [key, value] of Object.entries(searchParams)) {
        if (value !== void 0 && value !== null) {
          params.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
        }
      }
      queryString = params.join("&");
    }
    const hasQueryString = url.includes("?");
    if (queryString) {
      return url + (hasQueryString ? "&" : "?") + queryString;
    }
    return url;
  }
  getFullUrl(url, options) {
    const prefixUrl = options.prefixUrl ? options.prefixUrl.replace(/\/$/, "") : "";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return this.addSearchParams(url, options.searchParams);
    }
    const normalizedUrl = url.startsWith("/") ? url : `/${url}`;
    const fullUrl = `${prefixUrl}${normalizedUrl}`;
    return this.addSearchParams(fullUrl, options.searchParams);
  }
  // 创建具有 json 方法的 Promise
  createUniKyPromise(promise) {
    const uniKyPromise = promise;
    uniKyPromise.json = function() {
      return this.then((data) => {
        if (typeof data === "string") {
          try {
            return JSON.parse(data);
          } catch (e) {
            return data;
          }
        }
        return data;
      });
    };
    return uniKyPromise;
  }
  get(url, options = {}) {
    return this.createUniKyPromise(this.request(url, { ...options, method: "GET" }));
  }
  post(url, options = {}) {
    return this.createUniKyPromise(this.request(url, { ...options, method: "POST" }));
  }
  put(url, options = {}) {
    return this.createUniKyPromise(this.request(url, { ...options, method: "PUT" }));
  }
  delete(url, options = {}) {
    return this.createUniKyPromise(this.request(url, { ...options, method: "DELETE" }));
  }
  patch(url, options = {}) {
    return this.createUniKyPromise(this.request(url, { ...options, method: "PATCH" }));
  }
  head(url, options = {}) {
    return this.createUniKyPromise(this.request(url, { ...options, method: "HEAD" }));
  }
  options(url, options = {}) {
    return this.createUniKyPromise(this.request(url, { ...options, method: "OPTIONS" }));
  }
};
function createUniKy(defaultOptions = {}) {
  const base = new UniKyBase(defaultOptions);
  const uniKyFunction = (url, options = {}) => {
    return base["createUniKyPromise"](base["request"](url, options));
  };
  uniKyFunction.get = base.get.bind(base);
  uniKyFunction.post = base.post.bind(base);
  uniKyFunction.put = base.put.bind(base);
  uniKyFunction.delete = base.delete.bind(base);
  uniKyFunction.patch = base.patch.bind(base);
  uniKyFunction.head = base.head.bind(base);
  uniKyFunction.options = base.options.bind(base);
  uniKyFunction.create = (options) => {
    const mergedHooks = {
      beforeRequest: [...defaultOptions.hooks?.beforeRequest || []],
      afterResponse: [...defaultOptions.hooks?.afterResponse || []]
    };
    if (options.hooks?.beforeRequest) {
      if (Array.isArray(options.hooks.beforeRequest)) {
        mergedHooks.beforeRequest.push(...options.hooks.beforeRequest);
      } else {
        mergedHooks.beforeRequest.push(options.hooks.beforeRequest);
      }
    }
    if (options.hooks?.afterResponse) {
      if (Array.isArray(options.hooks.afterResponse)) {
        mergedHooks.afterResponse.push(...options.hooks.afterResponse);
      } else {
        mergedHooks.afterResponse.push(options.hooks.afterResponse);
      }
    }
    return createUniKy({
      ...defaultOptions,
      ...options,
      hooks: mergedHooks,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    });
  };
  uniKyFunction.extend = (options) => {
    return uniKyFunction.create(options);
  };
  return uniKyFunction;
}
var uniKy = createUniKy();

export { uniKy, useMountedLoad, useParam };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map