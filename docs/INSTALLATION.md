# Uniky 插件安装机制详解

本文档详细说明 `uniky` 包的插件文件安装机制，包括自动安装、手动安装和故障排除。

## 概述

`uniky` 采用三层安装保障机制：

1. **npm postinstall 钩子** - 在包安装时自动执行
2. **bin 命令手动触发** - 提供 `uniky-install` 命令
3. **Vite 插件自动检测** - 运行时自动安装缺失文件

## 安装机制详解

### 1. npm postinstall 钩子

#### 配置位置

`package.json`:
```json
{
  "scripts": {
    "postinstall": "node scripts/postinstall.js"
  }
}
```

#### 工作原理

- 当执行 `npm install uniky` 时，npm 会自动运行 `postinstall` 脚本
- 脚本会将 `src/plugin` 目录下的所有文件拷贝到项目根目录的 `.uniky/plugin` 文件夹
- 同时创建 `.uniky/index.ts` 入口文件

#### 执行时机

- ✅ 首次安装包时：`npm install uniky`
- ✅ 强制重装时：`npm install uniky --force`
- ✅ 删除 node_modules 后重新安装：`rm -rf node_modules && npm install`
- ❌ 普通的 `npm install`（包已存在）
- ❌ `npm update uniky`

#### 脚本逻辑

```javascript
function findProjectRoot() {
  // 1. 检查当前目录是否在 node_modules 中
  if (currentDir.includes('node_modules')) {
    // 找到 node_modules 的父目录（项目根目录）
    const parts = currentDir.split('node_modules');
    return parts[0].replace(/[\/\\]$/, '');
  }
  
  // 2. 向上查找包含 package.json 的目录
  // ...
}

function copyDirectoryRecursive(source, target) {
  // 递归拷贝整个目录，包括所有子目录和文件
  // ...
}

function installPluginFiles() {
  const projectRoot = findProjectRoot();
  const unikyDir = join(projectRoot, '.uniky');
  const pluginDir = join(unikyDir, 'plugin');
  const sourceDir = join(__dirname, '..', 'src', 'plugin');
  
  // 拷贝所有插件文件
  copyDirectoryRecursive(sourceDir, pluginDir);
  
  // 创建入口文件
  writeFileSync(join(unikyDir, 'index.ts'), `export * from './plugin/index.js';`);
}
```

### 2. bin 命令手动触发

#### 配置位置

`package.json`:
```json
{
  "bin": {
    "uniky-install": "./scripts/postinstall.js"
  }
}
```

#### 工作原理

1. npm 在安装包时，会在 `node_modules/.bin/` 目录下创建可执行文件
2. 对于 `uniky-install`，会创建一个指向 `node_modules/uniky/scripts/postinstall.js` 的软链接
3. 使用 `npx uniky-install` 时，会查找并执行这个命令

#### 使用方法

**方式 1：使用 npx（推荐）**
```bash
npx uniky-install
```

**方式 2：直接通过 node_modules/.bin 执行**
```bash
./node_modules/.bin/uniky-install
```

**方式 3：添加到 package.json scripts**
```json
{
  "scripts": {
    "setup": "uniky-install"
  }
}
```
然后运行：
```bash
npm run setup
```

#### 适用场景

- 删除了 `.uniky` 文件夹需要重新生成
- 更新 `uniky` 版本后需要更新插件文件
- CI/CD 流程中确保环境正确
- 多人协作时，其他开发者拉取代码后初始化

### 3. Vite 插件自动检测

#### 实现位置

`src/plugin/index.ts`:
```typescript
function ensurePluginInstalled(projectRoot: string): void {
  const unikyDir = join(projectRoot, '.uniky');
  const pluginDir = join(unikyDir, 'plugin');

  // 检查关键文件是否存在
  const keyFiles = ['index.ts', 'pages.defined.ts', 'global.defined.ts'];
  const needsInstall = !existsSync(pluginDir) || 
                       keyFiles.some(file => !existsSync(join(pluginDir, file)));

  if (!needsInstall) {
    return;
  }

  console.log('[uniky] 检测到插件文件缺失，正在自动安装...');
  
  // 自动安装逻辑...
}

export function unikyPlugin(options = {}): Plugin[] {
  const setupPlugin: Plugin = {
    name: 'vite-plugin-uniky-setup',
    configResolved(config) {
      ensurePluginInstalled(config.root);
    }
  };

  return [setupPlugin, ...其他插件];
}
```

#### 工作原理

1. 当 Vite 加载配置时，会调用插件的 `configResolved` 钩子
2. 在这个钩子中检查 `.uniky/plugin` 目录和关键文件是否存在
3. 如果缺失，从 `node_modules/uniky/src/plugin` 拷贝文件
4. 这是最后的保障机制，确保即使前两步失败也能正常工作

#### 适用场景

- postinstall 脚本执行失败
- `.gitignore` 忽略了 `.uniky` 文件夹，其他开发者拉取代码后
- 容器化部署时 node_modules 挂载方式特殊
- 任何其他导致文件缺失的情况

## 文件结构

### 安装后的目录结构

```
your-project/
├── .uniky/                          # 安装目标目录
│   ├── index.ts                     # 入口文件
│   └── plugin/                      # 插件文件目录
│       ├── index.ts                 # 插件总入口
│       ├── pages.defined.ts         # 页面路由生成插件
│       ├── global.defined.ts        # 全局定义生成插件
│       ├── http.defined.ts          # HTTP 配置生成插件
│       └── lib.defined.ts           # 其他辅助插件
├── node_modules/
│   ├── .bin/
│   │   └── uniky-install           # bin 命令软链接
│   └── uniky/
│       ├── src/
│       │   └── plugin/             # 源文件（安装源）
│       │       ├── index.ts
│       │       ├── pages.defined.ts
│       │       ├── global.defined.ts
│       │       ├── http.defined.ts
│       │       └── lib.defined.ts
│       └── scripts/
│           └── postinstall.js      # 安装脚本
└── vite.config.ts
```

### 生成的文件

插件运行时会在 `src/_unikey/` 目录下生成文件：

```
src/
└── _unikey/                         # 插件生成的文件
    ├── global/
    │   ├── pages.ts                # 页面路由定义
    │   └── ky.ts                   # HTTP 客户端配置
    ├── global.d.ts                 # 全局类型定义
    └── global.install.ts           # 全局变量安装文件
```

## 故障排除

### 问题 1：postinstall 没有执行

**症状：**
- 安装 `uniky` 后没有生成 `.uniky` 文件夹

**原因：**
- npm 默认只在首次安装时执行 postinstall
- 如果包已存在，再次 `npm install` 不会触发

**解决方案：**
```bash
# 方案 1：强制重装
npm install uniky --force

# 方案 2：删除后重装
rm -rf node_modules/uniky
npm install

# 方案 3：使用 bin 命令
npx uniky-install
```

### 问题 2：找不到 uniky-install 命令

**症状：**
```bash
$ npx uniky-install
command not found: uniky-install
```

**原因：**
- `uniky` 包未正确安装
- `node_modules/.bin` 目录没有正确创建软链接

**解决方案：**
```bash
# 1. 检查 uniky 是否已安装
npm list uniky

# 2. 重新安装
npm install uniky

# 3. 检查 bin 目录
ls -la node_modules/.bin/uniky-install

# 4. 如果还不行，直接运行脚本
node node_modules/uniky/scripts/postinstall.js
```

### 问题 3：权限问题

**症状：**
```bash
[uniky] ❌ 插件文件安装失败: Error: EACCES: permission denied
```

**原因：**
- 项目目录没有写入权限
- 在某些容器或 CI 环境中可能出现

**解决方案：**
```bash
# 1. 检查目录权限
ls -la .

# 2. 修改权限（如果需要）
chmod -R u+w .

# 3. 使用 sudo（不推荐，仅在必要时）
sudo npx uniky-install
```

### 问题 4：路径问题

**症状：**
```bash
[uniky] 错误: 源目录不存在 /path/to/node_modules/uniky/src/plugin
```

**原因：**
- 包结构不完整
- npm 安装时出现问题

**解决方案：**
```bash
# 1. 检查包是否完整
ls node_modules/uniky/src/plugin

# 2. 清除缓存重装
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 问题 5：.gitignore 导致文件缺失

**症状：**
- 本地开发正常，其他开发者或 CI 环境报错
- `.uniky` 文件夹不存在

**原因：**
- `.uniky` 被添加到 `.gitignore`

**建议：**

**方案 1：不要忽略 .uniky 文件夹（推荐）**
```gitignore
# .gitignore
# 不要添加 .uniky
```

**方案 2：添加初始化步骤**
```json
{
  "scripts": {
    "postinstall": "uniky-install"
  }
}
```

**方案 3：依赖自动检测**
- 什么都不做，依赖 Vite 插件的自动安装机制

## 最佳实践

### 1. 版本控制

**推荐做法：**
- ✅ 将 `.uniky` 文件夹提交到 Git
- ✅ 在 `.gitignore` 中忽略 `src/_unikey`（自动生成的文件）

```gitignore
# .gitignore
src/_unikey/
```

**原因：**
- `.uniky` 包含项目配置，应该版本控制
- `src/_unikey` 是运行时生成的，不需要提交

### 2. CI/CD 配置

```yaml
# .github/workflows/build.yml
- name: Install dependencies
  run: npm install

- name: Ensure uniky plugin installed
  run: npx uniky-install

- name: Build
  run: npm run build
```

### 3. 团队协作

在项目 README 中添加说明：

```markdown
## 开发环境设置

1. 安装依赖
   ```bash
   npm install
   ```

2. 如果遇到 uniky 插件相关错误，运行：
   ```bash
   npx uniky-install
   ```
```

### 4. Docker 环境

```dockerfile
FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

# 确保插件文件存在
RUN npx uniky-install || true

COPY . .
RUN npm run build
```

## 技术细节

### bin 命令的实现原理

1. **package.json 配置**
   ```json
   {
     "bin": {
       "uniky-install": "./scripts/postinstall.js"
     }
   }
   ```

2. **npm 安装时的操作**
   - 读取 `bin` 字段
   - 在 `node_modules/.bin/` 创建可执行文件或软链接
   - Unix/Linux/Mac: 创建符号链接
   - Windows: 创建 `.cmd` 批处理文件

3. **npx 的查找顺序**
   ```bash
   npx uniky-install
   ```
   - 首先查找 `node_modules/.bin/uniky-install`
   - 如果找不到，查找全局安装的包
   - 如果还找不到，临时下载并执行

### 脚本权限

在 Unix 系统中，脚本需要执行权限：

```bash
#!/usr/bin/env node

# 确保脚本有执行权限
chmod +x scripts/postinstall.js
```

npm 在创建 bin 链接时会自动处理权限。

## 总结

`uniky` 的安装机制提供了三层保障：

1. **自动安装（postinstall）** - 最佳体验，大多数情况下自动完成
2. **手动命令（bin）** - 灵活方便，适合各种场景
3. **运行时检测** - 最后保障，确保始终可用

这种设计确保了在各种环境和场景下，插件文件都能正确安装，给用户提供最佳的开发体验。