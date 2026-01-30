# @uniky/core

uni-app 开发工具库，提供常用的 hooks、http 请求封装和 vite 插件。

## 特性

- ✅ 直接使用 TypeScript 源码，无需编译
- ✅ 与用户项目共享依赖，避免冲突
- ✅ 完整的类型支持
- ✅ 开箱即用的 Vite 插件

## 安装

```bash
npm install uniky
# 或
pnpm add uniky
# 或
yarn add uniky
```

## 使用

### 库功能

```typescript
import { useParam } from '@uniky/core';

// 在页面中使用 hooks
const params = useParam();
```

### Vite 插件

在 `vite.config.ts` 中使用：

```typescript
import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';
import { unikyPlugin } from 'uniky/plugin';

export default defineConfig({
  plugins: [
    uni(),
    ...unikyPlugin({
      enablePages: true,  // 启用页面路由生成
      enableGlobal: true  // 启用全局定义生成
    })
  ]
});
```

#### 单独使用插件

```typescript
import { pagesDefinedPlugin, globalDefinedPlugin } from 'uniky/plugin';

export default defineConfig({
  plugins: [
    uni(),
    pagesDefinedPlugin(),    // 仅使用页面路由插件
    globalDefinedPlugin()    // 仅使用全局定义插件
  ]
});
```

## 插件功能

### pagesDefinedPlugin

从 `pages.json` 自动生成类型安全的路由定义，生成 `src/autoGen/global/pages.ts` 文件。

生成的内容包括：
- `_Pages`: 所有页面路径的常量数组
- `_PagePath`: 页面路径类型
- `_To`: 类型安全的路由跳转方法

使用示例：

```typescript
// 类型安全的路由跳转
_To.navigate('pages/index/index', {
  query: { id: '123' },
  json: { data: { name: 'test' } }
});

_To.redirect('pages/detail/detail');
_To.back();
```

### globalDefinedPlugin

收集 `src/autoGen/global` 目录下的 TypeScript 文件导出，自动生成：
- `src/autoGen/global.d.ts`: 全局类型定义
- `src/autoGen/global.install.ts`: 全局变量安装文件

在 `main.ts` 中安装全局定义：

```typescript
import { installGlobals } from './autoGen/global.install';

installGlobals();
```

## 架构说明

本库直接发布 TypeScript 源码，不进行编译。这样做的好处：

1. **避免依赖冲突**：使用项目自己的 vue、@dcloudio/uni-app 等依赖
2. **类型支持更好**：直接使用源码类型定义
3. **调试更方便**：可以直接查看和调试源码
4. **体积更小**：不包含编译后的代码

用户项目的构建工具（如 Vite）会自动处理这些 TypeScript 文件的编译。

## 发布

### 前置要求

需要安装 [gum](https://github.com/charmbracelet/gum) 用于交互式命令行：

```bash
# macOS
brew install gum

# Linux
brew install gum
# 或
go install github.com/charmbracelet/gum@latest
```

### 发布流程

使用自动发布脚本：

```bash
npm run publish:auto
```

或直接执行脚本：

```bash
./publish.sh
```

脚本会自动：
1. 检查 npm 登录状态
2. 交互式选择版本更新类型（默认 patch 补丁版本）
3. 更新 package.json 版本号
4. 预览源码目录结构
5. 确认后发布到 npm
6. 可选自动提交到 git

## License

MIT