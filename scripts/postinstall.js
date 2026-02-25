#!/usr/bin/env node
import { copyFileSync, mkdirSync, existsSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function findProjectRoot() {
  let currentDir = process.cwd();
  
  // 如果当前目录在 node_modules 中，向上查找到项目根目录
  if (currentDir.includes('node_modules')) {
    const parts = currentDir.split('node_modules');
    if (parts.length > 1) {
      // 返回 node_modules 的父目录
      return parts[0].replace(/[\/\\]$/, '');
    }
  }
  
  // 否则向上查找包含 package.json 和 node_modules 的目录
  const maxDepth = 10;
  let depth = 0;

  while (depth < maxDepth) {
    const packageJsonPath = join(currentDir, 'package.json');
    if (existsSync(packageJsonPath)) {
      return currentDir;
    }
    const parentDir = dirname(currentDir);
    if (parentDir === currentDir) break;
    currentDir = parentDir;
    depth++;
  }

  return process.cwd();
}

function copyDirectorySkipExisting(source, target) {
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
      count += copyDirectorySkipExisting(sourcePath, targetPath);
    } else if (!existsSync(targetPath)) {
      copyFileSync(sourcePath, targetPath);
      count++;
    }
  });

  return count;
}

function copyDirectoryRecursive(source, target) {
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

function installPluginFiles() {
  try {
    console.log('[uniky] 开始安装插件文件...');
    
    const projectRoot = findProjectRoot();
    console.log(`[uniky] 项目根目录: ${projectRoot}`);
    
    const unikyDir = join(projectRoot, '.uniky');
    const pluginDir = join(unikyDir, 'plugin');
    
    console.log(`[uniky] 目标目录: ${unikyDir}`);

    if (!existsSync(unikyDir)) {
      mkdirSync(unikyDir, { recursive: true });
      console.log(`[uniky] 创建目录: ${unikyDir}`);
    }

    const sourceDir = join(__dirname, '..', 'src', 'plugin');
    console.log(`[uniky] 源目录: ${sourceDir}`);
    
    if (!existsSync(sourceDir)) {
      console.error(`[uniky] 错误: 源目录不存在 ${sourceDir}`);
      return;
    }

    const copiedCount = copyDirectoryRecursive(sourceDir, pluginDir);
    console.log(`[uniky] 拷贝了 ${copiedCount} 个文件`);

    const indexContent = `// created by zhuxietong on 2026-01-30 16:37
export * from './plugin/index.js';
`;

    writeFileSync(join(unikyDir, 'index.ts'), indexContent, 'utf-8');
    console.log(`[uniky] 创建索引文件: ${join(unikyDir, 'index.ts')}`);

    console.log(`[uniky] ✅ 插件文件已成功安装到 ${unikyDir} (${copiedCount} 个文件)`);

    const skillsSourceDir = join(__dirname, '..', 'src', 'plugin', '.skills');
    const skillsTargetDir = join(projectRoot, '.skills');
    if (existsSync(skillsSourceDir)) {
      const skillsCopied = copyDirectorySkipExisting(skillsSourceDir, skillsTargetDir);
      if (skillsCopied > 0) {
        console.log(`[uniky] ✅ .skills 拷贝了 ${skillsCopied} 个新文件到 ${skillsTargetDir}`);
      } else {
        console.log(`[uniky] .skills 文件已存在，跳过拷贝`);
      }
    }
  } catch (error) {
    console.error('[uniky] ❌ 插件文件安装失败:', error);
    console.error('[uniky] 错误堆栈:', error.stack);
  }
}

installPluginFiles();