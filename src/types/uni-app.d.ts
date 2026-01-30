// created by zhuxietong on 2026-01-30 17:08

declare namespace UniApp {
  interface RequestOptions {
    url: string
    data?: any
    header?: Record<string, string>
    method?:
      | 'GET'
      | 'POST'
      | 'PUT'
      | 'DELETE'
      | 'CONNECT'
      | 'HEAD'
      | 'OPTIONS'
      | 'TRACE'
      | 'PATCH'
    timeout?: number
    dataType?: string
    responseType?: string
    sslVerify?: boolean
    withCredentials?: boolean
    firstIpv4?: boolean
    success?: (result: RequestSuccessCallbackResult) => void
    fail?: (result: GeneralCallbackResult) => void
    complete?: (result: GeneralCallbackResult) => void
  }

  interface RequestSuccessCallbackResult {
    data: any
    statusCode: number
    header: Record<string, string>
    cookies: string[]
    profile?: RequestProfile
  }

  interface RequestProfile {
    redirectStart: number
    redirectEnd: number
    fetchStart: number
    domainLookupStart: number
    domainLookupEnd: number
    connectStart: number
    connectEnd: number
    SSLconnectionStart: number
    SSLconnectionEnd: number
    requestStart: number
    requestEnd: number
    responseStart: number
    responseEnd: number
    rtt: number
    estimate_nettype: string
    httpRttEstimate: number
    transportRttEstimate: number
    throughputKbpsEstimate: number
    protocol: string
  }

  interface GeneralCallbackResult {
    errMsg: string
    errno?: number
    [key: string]: any
  }

  interface RequestTask {
    abort(): void
    offHeadersReceived(callback: (result: any) => void): void
    onHeadersReceived(callback: (result: any) => void): void
  }
}

declare const uni: {
  request(options: UniApp.RequestOptions): UniApp.RequestTask
  [key: string]: any
}
