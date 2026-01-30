// 该插件用于作为 vite.config.ts 中 作为插件；
// 该插件用于收集 src/autoGen/global文件夹下的ts文件 所有export 导出的内容， 并将其合并为一个全局定义文件 src/autoGen/global.d.ts 文件 同时，生成一个 /src/autoGen/global.install.ts 文件.
// 以便在项目中全局使用这些类型定义，避免了手动维护全局类型定义文件的麻烦。

import type { Plugin } from 'vite';
import * as fs from 'fs';
import * as path from 'path';

interface ExportInfo {
  name: string;
  type: 'function' | 'const' | 'class' | 'interface' | 'type' | 'enum';
  isDefault: boolean;
  filePath: string;
}

export default function globalDefinedPlugin(): Plugin {
  const globalDir = 'src/autoGen/global';
  const globalDtsPath = 'src/autoGen/global.d.ts';
  const installTsPath = 'src/autoGen/global.install.ts';

  /**
   * 递归获取目录下所有 .ts 文件（排除 .d.ts 和 install.ts）
   */
  function getTsFiles(dir: string): string[] {
    const files: string[] = [];

    if (!fs.existsSync(dir)) {
      return files;
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        files.push(...getTsFiles(fullPath));
      } else if (entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts') && entry.name !== 'global.install.ts') {
        files.push(fullPath);
      }
    }

    return files;
  }

  /**
   * 解析 TypeScript 文件，提取所有 export 的内容
   */
  function parseExports(filePath: string): ExportInfo[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    const exports: ExportInfo[] = [];

    // 匹配 export default
    const defaultExportRegex = /export\s+default\s+(function|class|const|let|var)?\s*([a-zA-Z_$][a-zA-Z0-9_$]*)?/g;
    let match;

    while ((match = defaultExportRegex.exec(content)) !== null) {
      if (match[2]) {
        exports.push({
          name: match[2],
          type: (match[1] as any) || 'const',
          isDefault: true,
          filePath
        });
      }
    }

    // 匹配 export function
    const functionRegex = /export\s+(?:async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    while ((match = functionRegex.exec(content)) !== null) {
      exports.push({
        name: match[1],
        type: 'function',
        isDefault: false,
        filePath
      });
    }

    // 匹配 export const/let/var
    const varRegex = /export\s+(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    while ((match = varRegex.exec(content)) !== null) {
      exports.push({
        name: match[1],
        type: 'const',
        isDefault: false,
        filePath
      });
    }

    // 匹配 export class
    const classRegex = /export\s+(?:abstract\s+)?class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    while ((match = classRegex.exec(content)) !== null) {
      exports.push({
        name: match[1],
        type: 'class',
        isDefault: false,
        filePath
      });
    }

    // 匹配 export interface
    const interfaceRegex = /export\s+interface\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    while ((match = interfaceRegex.exec(content)) !== null) {
      exports.push({
        name: match[1],
        type: 'interface',
        isDefault: false,
        filePath
      });
    }

    // 匹配 export type
    const typeRegex = /export\s+type\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    while ((match = typeRegex.exec(content)) !== null) {
      exports.push({
        name: match[1],
        type: 'type',
        isDefault: false,
        filePath
      });
    }

    // 匹配 export enum
    const enumRegex = /export\s+(?:const\s+)?enum\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    while ((match = enumRegex.exec(content)) !== null) {
      exports.push({
        name: match[1],
        type: 'enum',
        isDefault: false,
        filePath
      });
    }

    // 匹配 export { ... }
    const namedExportRegex = /export\s*{([^}]+)}/g;
    while ((match = namedExportRegex.exec(content)) !== null) {
      const names = match[1].split(',').map(n => n.trim().split(/\s+as\s+/)[0].trim());
      for (const name of names) {
        if (name) {
          exports.push({
            name,
            type: 'const',
            isDefault: false,
            filePath
          });
        }
      }
    }

    return exports;
  }

  /**
   * 生成 global.d.ts 文件内容
   */
  function generateGlobalDts(allExports: ExportInfo[]): string {
    const imports = new Map<string, Set<string>>();

    // 按文件分组导出
    for (const exp of allExports) {
      const relativePath = path.relative('src/autoGen', exp.filePath).replace(/\\/g, '/').replace(/\.ts$/, '');
      if (!imports.has(relativePath)) {
        imports.set(relativePath, new Set());
      }
      if (!exp.isDefault) {
        imports.get(relativePath)!.add(exp.name);
      }
    }

    let content = '// 自动生成的全局类型定义文件\n';
    content += '// 请勿手动修改\n\n';

    // 生成 import 语句
    for (const [filePath, names] of imports) {
      if (names.size > 0) {
        content += `import type { ${Array.from(names).join(', ')} } from './${filePath}';\n`;
      }
    }

    content += '\n';

    // 生成全局声明
    content += 'declare global {\n';

    // 对于函数、常量、类等，添加到全局
    const globalItems = allExports.filter(exp => !exp.isDefault && exp.type !== 'interface' && exp.type !== 'type');
    if (globalItems.length > 0) {
      for (const exp of globalItems) {
        if (exp.type === 'function') {
          content += `  const ${exp.name}: typeof import('./${path.relative('src/autoGen', exp.filePath).replace(/\\/g, '/').replace(/\.ts$/, '')}').${exp.name};\n`;
        } else if (exp.type === 'const') {
          content += `  const ${exp.name}: typeof import('./${path.relative('src/autoGen', exp.filePath).replace(/\\/g, '/').replace(/\.ts$/, '')}').${exp.name};\n`;
        } else if (exp.type === 'class') {
          content += `  const ${exp.name}: typeof import('./${path.relative('src/autoGen', exp.filePath).replace(/\\/g, '/').replace(/\.ts$/, '')}').${exp.name};\n`;
        }
      }
    }

    content += '}\n\n';
    content += 'export {};\n';

    return content;
  }

  /**
   * 生成 global.install.ts 文件内容
   */
  function generateInstallTs(allExports: ExportInfo[]): string {
    const imports = new Map<string, { names: Set<string>; hasDefault: boolean; defaultName?: string }>();

    // 按文件分组导出
    for (const exp of allExports) {
      const relativePath = './global/' + path.relative(path.join('src', 'autoGen', 'global'), exp.filePath).replace(/\\/g, '/').replace(/\.ts$/, '');
      if (!imports.has(relativePath)) {
        imports.set(relativePath, { names: new Set(), hasDefault: false });
      }
      const importInfo = imports.get(relativePath)!;
      if (exp.isDefault) {
        importInfo.hasDefault = true;
        importInfo.defaultName = exp.name;
      } else if (exp.type !== 'interface' && exp.type !== 'type') {
        importInfo.names.add(exp.name);
      }
    }

    let content = '// 自动生成的全局安装文件\n';
    content += '// 请勿手动修改\n\n';

    // 生成 import 语句
    for (const [filePath, info] of imports) {
      if (info.hasDefault && info.names.size > 0) {
        content += `import ${info.defaultName}, { ${Array.from(info.names).join(', ')} } from '${filePath}';\n`;
      } else if (info.hasDefault) {
        content += `import ${info.defaultName} from '${filePath}';\n`;
      } else if (info.names.size > 0) {
        content += `import { ${Array.from(info.names).join(', ')} } from '${filePath}';\n`;
      }
    }

    content += '\n';
    content += '/**\n';
    content += ' * 安装全局定义\n';
    content += ' * 在 main.ts 中调用此函数以注册全局变量\n';
    content += ' */\n';
    content += 'export function installGlobals() {\n';

    // 将导出的内容挂载到 globalThis
    const globalItems = allExports.filter(exp => exp.type !== 'interface' && exp.type !== 'type');
    for (const exp of globalItems) {
      const name = exp.isDefault ? (imports.get('./global/' + path.relative(path.join('src', 'autoGen', 'global'), exp.filePath).replace(/\\/g, '/').replace(/\.ts$/, ''))?.defaultName || exp.name) : exp.name;
      content += `  (globalThis as any).${exp.name} = ${name};\n`;
    }

    content += '}\n';

    return content;
  }

  /**
   * 生成所有文件
   */
  function generate() {
    try {
      const tsFiles = getTsFiles(globalDir);

      if (tsFiles.length === 0) {
        console.log('[globalDefined] 未找到任何 TypeScript 文件');
        return;
      }

      // 收集所有导出
      const allExports: ExportInfo[] = [];
      for (const file of tsFiles) {
        const exports = parseExports(file);
        allExports.push(...exports);
      }

      if (allExports.length === 0) {
        console.log('[globalDefined] 未找到任何导出');
        return;
      }

      // 生成 global.d.ts
      const dtsContent = generateGlobalDts(allExports);
      fs.writeFileSync(globalDtsPath, dtsContent, 'utf-8');
      console.log(`[globalDefined] 已生成 ${globalDtsPath}`);

      // 生成 global.install.ts
      const installContent = generateInstallTs(allExports);
      fs.writeFileSync(installTsPath, installContent, 'utf-8');
      console.log(`[globalDefined] 已生成 ${installTsPath}`);

      console.log(`[globalDefined] 共处理 ${tsFiles.length} 个文件，${allExports.length} 个导出`);
    } catch (error) {
      console.error('[globalDefined] 生成失败:', error);
    }
  }

  return {
    name: 'vite-plugin-global-defined',

    buildStart() {
      // 构建开始时生成文件
      generate();
    },

    configureServer(server) {
      // 监听 src/autoGen/global 目录下的文件变化
      server.watcher.add(globalDir);

      server.watcher.on('change', (file) => {
        if (file.includes('src/autoGen/global') && file.endsWith('.ts') && !file.endsWith('.d.ts') && !file.includes('global.install.ts')) {
          console.log(`[globalDefined] 检测到文件变化: ${file}`);
          generate();
        }
      });

      server.watcher.on('add', (file) => {
        if (file.includes('src/autoGen/global') && file.endsWith('.ts') && !file.endsWith('.d.ts') && !file.includes('global.install.ts')) {
          console.log(`[globalDefined] 检测到新文件: ${file}`);
          generate();
        }
      });

      server.watcher.on('unlink', (file) => {
        if (file.includes('src/autoGen/global') && file.endsWith('.ts') && !file.endsWith('.d.ts') && !file.includes('global.install.ts')) {
          console.log(`[globalDefined] 检测到文件删除: ${file}`);
          generate();
        }
      });
    }
  };
}
