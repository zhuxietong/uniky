# @uniky/core

uni-app 开发工具库，提供常用的 hooks、http 请求封装和 vite 插件。

## 特性

- ✅ 混合发布模式：lib 使用 TS 源码，plugin 编译为 JS
- ✅ 与用户项目共享依赖，避免冲突
- ✅ 完整的类型支持
- ✅ 开箱即用的 Vite 插件，兼容各种构建环境

## 安装

```bash
npm install uniky
# 或
pnpm add uniky
# 或
yarn add uniky
```

## 安装后设置

> 📖 **详细文档**: [安装机制完整说明](./docs/INSTALLATION.md)

### 自动安装（推荐）

安装 `uniky` 后，插件文件会自动安装到项目根目录的 `.uniky` 文件夹。

如果自动安装失败或删除了 `.uniky` 文件夹，可以手动触发安装：

```bash
# 方式 1: 使用 npx（推荐）
npx uniky-install

# 方式 2: 直接运行脚本
node node_modules/uniky/scripts/postinstall.js

# 方式 3: 重新安装包
npm install uniky --force
```

### bin 命令说明

`uniky-install` 是一个可执行命令，通过 `package.json` 中的 `bin` 字段注册：

```json
{
  "bin": {
    "uniky-install": "./scripts/postinstall.js"
  }
}
```

**工作原理：**

1. 当你在项目中安装 `uniky` 时，npm 会自动在 `node_modules/.bin/` 目录下创建 `uniky-install` 命令的软链接
2. 这个命令指向 `node_modules/uniky/scripts/postinstall.js` 脚本
3. 使用 `npx uniky-install` 可以直接执行该脚本，无需记住具体路径

**使用场景：**

- 删除了 `.uniky` 文件夹后需要重新生成
- 更新 `uniky` 包后需要更新插件文件
- CI/CD 环境中确保插件文件存在
- 调试插件安装问题

**执行效果：**

```bash
$ npx uniky-install
[uniky] 开始安装插件文件...
[uniky] 项目根目录: /path/to/your-project
[uniky] 目标目录: /path/to/your-project/.uniky
[uniky] 创建目录: /path/to/your-project/.uniky
[uniky] 源目录: /path/to/your-project/node_modules/uniky/src/plugin
[uniky] 拷贝了 5 个文件
[uniky] 创建索引文件: /path/to/your-project/.uniky/index.ts
[uniky] ✅ 插件文件已成功安装到 /path/to/your-project/.uniky (5 个文件)
```

### 自动检测安装

如果 `.uniky` 文件夹缺失，在首次运行 Vite 时，插件会自动检测并安装所需文件。这是最后的保障机制。

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
import { installGlobals } from './_unikey/global.install';

installGlobals();
```

## 目录结构

安装后，项目根目录会生成 `.uniky` 文件夹：

```
your-project/
├── .uniky/
│   ├── index.ts
│   └── plugin/
│       ├── index.ts
│       ├── pages.defined.ts
│       ├── global.defined.ts
│       ├── http.defined.ts
│       └── lib.defined.ts
├── src/
│   └── _unikey/           # 插件自动生成的文件
│       ├── global/
│       │   ├── pages.ts
│       │   └── ky.ts
│       ├── global.d.ts
│       └── global.install.ts
└── vite.config.ts
```

## 故障排除

### ESM 相关错误

如果遇到类似以下错误：

```
ERROR: [plugin: externalize-deps] Failed to resolve "uniky/plugin". 
This package is ESM only but it was tried to load by `require`.
```

**解决方案：**

1. **确保项目 package.json 配置正确**

在使用 `uniky` 的项目中，确保 `package.json` 包含：

```json
{
  "type": "module"
}
```

2. **确保 vite.config.ts 使用 ES 模块语法**

```typescript
// ✅ 正确 - 使用 import
import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';
import { unikyPlugin } from 'uniky/plugin';

export default defineConfig({
  plugins: [uni(), ...unikyPlugin()]
});

// ❌ 错误 - 不要使用 require
const { unikyPlugin } = require('uniky/plugin');
```

3. **配置 Vite 以正确处理 TypeScript 源码**

如果使用的是 TypeScript 源码版本，确保 `vite.config.ts` 中正确配置：

```typescript
import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';
import { unikyPlugin } from 'uniky/plugin';

export default defineConfig({
  plugins: [uni(), ...unikyPlugin()],
  optimizeDeps: {
    // 排除 uniky 包，让 Vite 直接处理其 TS 源码
    exclude: ['uniky']
  }
});
```

4. **检查 tsconfig.json 配置**

确保项目的 `tsconfig.json` 支持 ESM：

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  }
}
```

5. **检查 Node.js 版本**

确保使用 Node.js 16+ 版本，该版本对 ESM 支持更好。

6. **清除缓存后重试**

```bash
# 清除 node_modules 和 lock 文件
rm -rf node_modules package-lock.json
npm install

# 或使用 pnpm/yarn
rm -rf node_modules pnpm-lock.yaml
pnpm install

# 清除 Vite 缓存
rm -rf node_modules/.vite
```

7. **本地开发时使用 npm link**

如果是本地开发调试 `uniky` 包：

```bash
# 在 uniky 目录
npm link

# 在使用项目目录
npm link uniky
```

## 架构说明

本库采用**混合发布模式**：

### lib 部分 - TypeScript 源码
- 直接发布 TS 源码（`src/lib/**/*`）
- 由用户项目的构建工具（Vite）处理编译
- 优势：
  - 避免依赖冲突，使用项目自己的 vue、@dcloudio/uni-app 等依赖
  - 类型支持更好，直接使用源码类型定义
  - 调试更方便，可以直接查看和调试源码
  - 体积更小，不包含编译后的代码

### plugin 部分 - 编译后的 JavaScript
- 编译为 JS 文件（`dist/plugin/**/*`）
- 包含完整的类型定义（`.d.ts` 文件）
- 原因：
  - Vite 配置文件在加载时使用 esbuild
  - esbuild 在某些环境下会尝试用 `require()` 加载模块
  - 编译为 JS 可以避免 ESM 兼容性问题

这种混合模式结合了两种方式的优势，既保持了库的灵活性，又确保了插件的兼容性。

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

## 开发说明

### 本地开发

1. 克隆仓库
```bash
git clone https://github.com/zhuxietong/uniky.git
cd uniky
```

2. 安装依赖
```bash
npm install
```

3. 构建 plugin（仅编译 plugin 部分）
```bash
npm run build
```

4. 链接到本地项目
```bash
npm link
cd /path/to/your-project
npm link uniky
```

### 发布流程

```bash
npm run publish:auto
```

发布前会自动执行 `npm run build`，编译 plugin 部分。

## License

MIT