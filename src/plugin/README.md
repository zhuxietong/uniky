# UniKy 插件系统

该目录包含 UniKy 框架的自动代码生成插件。

## 插件列表

### 1. global.defined.ts - 全局定义插件

自动收集 `src/_unikey/global` 文件夹下的所有导出内容，生成全局类型定义和安装文件。

### 2. pages.defined.ts - 页面路由插件

自动处理页面路由相关的代码生成。

### 3. http.defined.ts - HTTP 请求代码生成插件

基于 OpenAPI 规范自动生成类型安全的 HTTP 请求函数。

## HTTP 插件使用说明

### 工作原理

1. 插件会读取项目中的 OpenAPI 规范文件（支持多个位置）
2. 解析所有 API 路径和方法
3. 自动生成对应的请求函数
4. 生成的代码保存到 `src/_unikey/global/ky.ts`

### OpenAPI 文件位置

插件会按以下顺序查找 OpenAPI 规范文件：

1. `.uniky/oas/openapi.json`（推荐）
2. `openapi.json`
3. `swagger.json`
4. `api-docs.json`

### 生成规则

**路径命名转换：**
- `/api/sys.account/login` → `apiSysAccountLogin()`
- `/api/util.tool/upload` → `apiUtilToolUpload()`

**请求方法：**
- GET/DELETE 请求：`functionName(params?: any)`
- POST/PUT/PATCH 请求：`functionName(data?: any, params?: any)`

### 生成的代码结构

```typescript
// 1. uniKy 实例配置
export const _ky = uniKy.create({
  prefixUrl: baseUrl,
  hooks: { ... },
  timeout: 30000
});

// 2. useKyData Hook
export function useKyData<T, O extends object = {}>(...)

// 3. API 请求函数
export function apiSysAccountLogin(data?: any, params?: any) {
  return _ky.post('/api/sys.account/login', { data, params })
    .then(res => res.data);
}
```

### 使用示例

```typescript
// 直接调用
import { apiSysAccountLogin } from '@/_unikey/global/ky';

await apiSysAccountLogin({ username: 'admin', password: '123456' });

// 使用 Hook
import { useKyData, apiPitfallIndexQuery } from '@/_unikey/global/ky';

const { data, run } = useKyData(apiPitfallIndexQuery, []);
```

### 重新生成代码

插件会在以下情况自动重新生成代码：

1. 项目启动时（如果文件不存在）
2. OpenAPI 规范文件发生变化时

如果需要手动触发重新生成，删除 `src/_unikey/global/ky.ts` 文件后重启开发服务器。

### 配置选项

在 `vite.config.ts` 中配置插件：

```typescript
import { unikyPlugin } from './.uniky/index';

export default defineConfig({
  plugins: [
    uni(),
    unikyPlugin({
      enablePages: true,   // 启用页面插件
      enableGlobal: true,  // 启用全局定义插件
      enableHttp: true     // 启用 HTTP 插件（默认启用）
    })
  ]
});
```

### 注意事项

1. **文件保护**：如果 `ky.ts` 文件已存在，插件不会覆盖，需手动删除后才会重新生成
2. **路径格式**：OpenAPI 中的路径需要符合 RESTful 规范
3. **自动导入**：生成的函数可以通过全局定义系统自动导入使用