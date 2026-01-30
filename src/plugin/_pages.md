
src/autoGen/global/pages.ts 的生成逻辑
```ts
// pages.json 提取到的path 整理
export const _Pages = ["pages/home/index", "pages/about/index", "pages/profile/index"] as const;
export type _PagePath = typeof _Pages[number];


type RouteFunction = (path: _PagePath, options: { query: Record<string, any>, json: Record<string, any> }) => void;
interface ToRouteInterface {
  navigate: RouteFunction;
  redirect: RouteFunction;
  switchTab: RouteFunction;
  reLaunch: RouteFunction;
  back: (delta?: number) => void;
}

const ToRoute: ToRouteInterface = {
  push: (path, options) => {
    // Implementation for navigate
  },
  redirect: (path, options) => {
    // Implementation for redirect
  },
  switchTab: (path, options) => {
    // Implementation for switchTab
  },
  reLaunch: (path, options) => {
    // Implementation for reLaunch
  },
  back: (delta = 1) => {
    // Implementation for back
  }
};

export const _To = ToRoute;
```
