// created by zhuxietong on 2026-01-30 16:37
import type { Plugin } from 'vite';
import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import pagesDefinedPlugin from './pages.defined';
import globalDefinedPlugin from './global.defined';
import httpDefinedPlugin from './http.defined';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function copyDirectoryRecursive(source: string, target: string): number {
  if (!existsSync(target)) {
    mkdirSync(target, { recursive: true });
  }

  const files = readdirSync(source);
  let count = 0;

  files.forEach(file => {
    const sourcePath = join(source, file);
    const targetPath = join(target, file);
    const stat = statSync(sourcePath);

    if (stat.isDirectory()) {
      count += copyDirectoryRecursive(sourcePath, targetPath);
    } else {
      copyFileSync(sourcePath, targetPath);
      count++;
    }
  });

  return count;
}

function ensurePluginInstalled(projectRoot: string): void {
  try {
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

    if (!existsSync(unikyDir)) {
      mkdirSync(unikyDir, { recursive: true });
    }

    let sourceDir = __dirname;
    
    if (sourceDir.includes('node_modules')) {
      const nodeModulesIndex = sourceDir.indexOf('node_modules');
      const nodeModulesPath = sourceDir.substring(0, nodeModulesIndex + 'node_modules'.length);
      sourceDir = join(nodeModulesPath, 'uniky', 'src', 'plugin');
    }
    
    if (!existsSync(sourceDir)) {
      console.warn(`[uniky] 源目录不存在: ${sourceDir}`);
      return;
    }

    const copiedCount = copyDirectoryRecursive(sourceDir, pluginDir);

    const indexContent = `// created by zhuxietong on 2026-01-30 16:37
export * from './plugin/index.js';
`;
    writeFileSync(join(unikyDir, 'index.ts'), indexContent, 'utf-8');

    console.log(`[uniky] ✅ 插件文件已自动安装到 ${unikyDir} (${copiedCount} 个文件)`);
  } catch (error) {
    console.warn('[uniky] 插件自动安装失败:', error);
  }
}



export interface UnikyPluginOptions {
  enablePages?: boolean;
  enableGlobal?: boolean;
  enableHttp?: boolean;
}

export function unikyPlugin(options: UnikyPluginOptions = {}): Plugin[] {
  const { enablePages = true, enableGlobal = true, enableHttp = true } = options;

  const plugins: Plugin[] = [];

  const setupPlugin: Plugin = {
    name: 'vite-plugin-uniky-setup',
    configResolved(config) {
      ensurePluginInstalled(config.root);
    }
  };

  plugins.push(setupPlugin);

  if (enablePages) {
    plugins.push(pagesDefinedPlugin());
  }
  if (enableHttp) {
    plugins.push(httpDefinedPlugin());
  }
  if (enableGlobal) {
    plugins.push(globalDefinedPlugin());
  }

  return plugins;
}

export { pagesDefinedPlugin, globalDefinedPlugin, httpDefinedPlugin };

export default unikyPlugin;
