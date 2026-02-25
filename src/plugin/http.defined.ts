// created by zhuxietong on 2026-01-30 23:22
// 该插件用于生成基础的 HTTP 请求配置
// 生成的代码将保存到 src/_uniky/global/ky.ts

import type { Plugin } from 'vite';
import * as fs from 'node:fs';
import * as path from 'node:path';

export default function httpDefinedPlugin(): Plugin {
  const outputPath = 'src/_uniky/global/ky.ts';

  /**
   * 生成基础请求配置代码
   */
  function generateCode(): string {
    let code = `// created by zhuxietong on 2026-01-30 23:22\n`;
    code += `import { uniKy, useMountedLoad } from "uniky";\n`;
    code += `import { ref } from "vue";\n\n`;

    code += `const baseUrl = import.meta.env.VITE_API_BASE_URL;\n\n`;

    code += `export const _ky = uniKy.create({\n`;
    code += `  prefixUrl: baseUrl,\n`;
    code += `  hooks: {\n`;
    code += `    beforeRequest: [\n`;
    code += `      (request, options) => {\n`;
    code += `        const headers = options.headers || {};\n`;
    code += `        try {\n`;
    code += `          const user = uni.getStorageSync('user') || '{}';\n`;
    code += `          const { token } = JSON.parse(user);\n`;
    code += `          if (token) {\n`;
    code += `            headers['Authorization'] = 'Bearer ' + token;\n`;
    code += `          }\n`;
    code += `          options.headers = headers;\n`;
    code += `        } catch (e) {}\n`;
    code += `      },\n`;
    code += `    ],\n`;
    code += `    afterResponse: [\n`;
    code += `      (resp: any, request, options) => {},\n`;
    code += `    ],\n`;
    code += `  },\n`;
    code += `  timeout: 30000,\n`;
    code += `});\n\n`;

    code += `export function useKyData<T, O extends object = {}>(req: (option: O) => Promise<T>, defaultValue?: T) {\n`;
    code += `  const data = ref<T | undefined>(defaultValue);\n`;
    code += `  const option = ref<any>({});\n`;
    code += `  const run = () => {\n`;
    code += `    return new Promise((resolve, reject) => {\n`;
    code += `      req(option.value)\n`;
    code += `        .then((res: any) => {\n`;
    code += `          data.value = res;\n`;
    code += `          resolve(res);\n`;
    code += `        })\n`;
    code += `        .catch((err) => {\n`;
    code += `          reject(err);\n`;
    code += `        });\n`;
    code += `    });\n`;
    code += `  };\n\n`;
    code += `  useMountedLoad(({ option:o, query, json }) => {\n`;
    code += `    option.value = option;\n`;
    code += `    run()\n`;
    code += `      .then(() => {})\n`;
    code += `      .catch(() => {});\n`;
    code += `  });\n\n`;
    code += `  return {\n`;
    code += `    data,\n`;
    code += `    run,\n`;
    code += `  };\n`;
    code += `}\n`;

    return code;
  }

  /**
   * 生成文件
   */
  function generate() {
    try {
      if (fs.existsSync(outputPath)) {
        console.log(`[httpDefined] 文件已存在，跳过生成: ${outputPath}`);
        return;
      }

      const code = generateCode();

      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(outputPath, code, 'utf-8');
      console.log(`[httpDefined] 已生成 ${outputPath}`);
    } catch (error) {
      console.error('[httpDefined] 生成失败:', error);
    }
  }

  return {
    name: 'vite-plugin-http-defined',

    buildStart() {
      generate();
    }
  };
}