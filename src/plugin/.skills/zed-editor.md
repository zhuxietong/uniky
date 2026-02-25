---
name: zed-editor-compatible
description: zed编辑器适配尝试
---

## 如果编辑中vue路径不能完整适配查找问题的修复
如果编辑器中光标移动到vue文件路径时按住cmd ，弹出：module "*.vue" 而非完整路径则可进行以下尝试【试过有效】

1. 升级 `typescript` 从 4.9 → 5.9，`vue-tsc` 从 1.x → 2.x
2. 移除已废弃的 `preserveValueImports` / `importsNotUsedAsValues`，改用 `verbatimModuleSyntax
3. 安装 `@vue/typescript-plugin` 使 Volar v2 能正确推导 `.vue` 模块类型
