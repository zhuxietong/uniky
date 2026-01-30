#!/usr/bin/env node
import { copyFileSync, mkdirSync, existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function findProjectRoot() {
  let currentDir = process.cwd();
  const maxDepth = 10;
  let depth = 0;

  while (depth < maxDepth) {
    const packageJsonPath = join(currentDir, 'package.json');
    if (existsSync(packageJsonPath)) {
      const nodeModulesPath = join(currentDir, 'node_modules');
      if (existsSync(nodeModulesPath)) {
        return currentDir;
      }
    }
    const parentDir = dirname(currentDir);
    if (parentDir === currentDir) break;
    currentDir = parentDir;
    depth++;
  }

  return process.cwd();
}

function installPluginFiles() {
  try {
    const projectRoot = findProjectRoot();
    const unikyDir = join(projectRoot, '.uniky');
    const pluginDir = join(unikyDir, 'plugin');

    if (!existsSync(unikyDir)) {
      mkdirSync(unikyDir, { recursive: true });
    }

    if (!existsSync(pluginDir)) {
      mkdirSync(pluginDir, { recursive: true });
    }

    const sourceDir = join(__dirname, '..', 'src', 'plugin');
    const filesToCopy = [
      'pages.defined.ts',
      'global.defined.ts',
      'lib.defined.ts',
      'index.ts'
    ];

    let copiedCount = 0;
    filesToCopy.forEach(file => {
      const sourcePath = join(sourceDir, file);
      const targetPath = join(pluginDir, file);

      if (existsSync(sourcePath)) {
        copyFileSync(sourcePath, targetPath);
        copiedCount++;
      }
    });

    const indexContent = `// created by zhuxietong on 2026-01-30 16:37
export * from './plugin/index.js';
`;

    writeFileSync(join(unikyDir, 'index.ts'), indexContent, 'utf-8');

    console.log(`[uniky] 插件文件已安装到 ${unikyDir} (${copiedCount} 个文件)`);
  } catch (error) {
    console.warn('[uniky] 插件文件安装失败，将在 vite 启动时自动安装:', error.message);
  }
}

installPluginFiles();