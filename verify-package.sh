#!/bin/bash

echo "🔍 验证 uniky 包结构..."
echo ""

echo "✅ 检查发布文件:"
echo "   - src/lib (TypeScript 源码)"
ls -la src/lib/ | grep -E "\.ts$" | wc -l | xargs echo "     找到 TS 文件数:"

echo "   - dist/plugin (编译后的 JS)"
ls -la dist/plugin/ | grep -E "\.js$" | wc -l | xargs echo "     找到 JS 文件数:"
ls -la dist/plugin/ | grep -E "\.d\.ts$" | wc -l | xargs echo "     找到 d.ts 文件数:"

echo ""
echo "✅ 检查 package.json 配置:"
echo "   - exports['.'] -> $(cat package.json | jq -r '.exports["."].import')"
echo "   - exports['./plugin'] -> $(cat package.json | jq -r '.exports["./plugin"].import')"

echo ""
echo "✅ 检查构建配置:"
echo "   - tsconfig include: $(cat tsconfig.json | jq -r '.include[]')"
echo "   - tsconfig exclude: $(cat tsconfig.json | jq -r '.exclude[]' | head -1)"

echo ""
echo "✅ 文档文件:"
ls -la | grep -E "README|CHANGELOG|ARCHITECTURE" | awk '{print "   -", $9}'

echo ""
echo "🎉 验证完成！"
