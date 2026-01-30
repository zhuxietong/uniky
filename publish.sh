#!/bin/bash
# created by zhuxietong on 2026-01-30 16:50

set -e

OTP_CODE=""
while [[ $# -gt 0 ]]; do
  case $1 in
    --otp=*)
      OTP_CODE="${1#*=}"
      shift
      ;;
    --otp)
      OTP_CODE="$2"
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done

if ! command -v gum &> /dev/null; then
  echo "❌ 错误: 未安装 gum"
  echo "请安装 gum: brew install gum"
  exit 1
fi

if [ ! -f "package.json" ]; then
  gum style --foreground 196 "❌ 错误: 未找到 package.json 文件"
  exit 1
fi

gum style --foreground 245 "🔐 检查 npm 登录状态..."
if ! npm whoami &> /dev/null; then
  gum style --foreground 214 "⚠️  未登录 npm"
  echo ""
  gum style --foreground 245 "请登录 npm 账号："
  npm login
  
  if ! npm whoami &> /dev/null; then
    gum style --foreground 196 "❌ 登录失败"
    exit 1
  fi
fi

npm_user=$(npm whoami)
gum style --foreground 82 "✅ 已登录: $npm_user"
echo ""

current_version=$(node -p "require('./package.json').version")
package_name=$(node -p "require('./package.json').name")

gum style --bold --foreground 212 "📦 开始发布流程"
gum style --foreground 245 "📦 包名: $package_name"
gum style --foreground 245 "📌 当前版本: $current_version"
echo ""

version_type=$(gum choose --header "选择版本更新类型:" \
  "patch (补丁版本)" \
  "minor (次版本)" \
  "major (主版本)" \
  "自定义版本号" \
  --selected "patch (补丁版本)")

case $version_type in
  "patch (补丁版本)")
    version_type="patch"
    ;;
  "minor (次版本)")
    version_type="minor"
    ;;
  "major (主版本)")
    version_type="major"
    ;;
  "自定义版本号")
    custom_version=$(gum input --placeholder "输入新版本号 (如 1.2.3)")
    if [[ ! $custom_version =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
      gum style --foreground 196 "❌ 错误: 版本号格式不正确"
      exit 1
    fi
    version_type=$custom_version
    ;;
esac

if [[ $version_type =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  npm version $version_type --no-git-tag-version --allow-same-version
else
  npm version $version_type --no-git-tag-version
fi

new_version=$(node -p "require('./package.json').version")
gum style --foreground 82 "✅ 版本已更新: $current_version -> $new_version"
echo ""

if [ ! -d "src" ]; then
  gum style --foreground 196 "❌ 错误: src 目录不存在"
  exit 1
fi

gum style --foreground 245 "📂 源码目录结构:"
ls -lh src/ | tail -n +2 | awk '{print "   " $9}'
echo ""

confirm=$(gum confirm "是否发布 v$new_version 到 https://www.npmjs.com ?" && echo "yes" || echo "no")

if [ "$confirm" != "yes" ]; then
  gum style --foreground 214 "❌ 已取消发布"
  exit 0
fi

echo ""
gum style --foreground 245 "📤 正在发布到 https://www.npmjs.com ..."
echo ""

MAX_RETRY=3
retry_count=0
publish_success=false

while [ $retry_count -lt $MAX_RETRY ]; do
  if [ -n "$OTP_CODE" ]; then
    npm publish --access public --otp="$OTP_CODE" 2>&1 | tee /tmp/npm-publish.log
  else
    npm publish --access public 2>&1 | tee /tmp/npm-publish.log
  fi
  
  if [ ${PIPESTATUS[0]} -eq 0 ]; then
    publish_success=true
    break
  fi
  
  if grep -q "EOTP" /tmp/npm-publish.log; then
    retry_count=$((retry_count + 1))
    
    if [ $retry_count -lt $MAX_RETRY ]; then
      echo ""
      gum style --foreground 214 "⚠️  需要 OTP 验证码 (尝试 $retry_count/$MAX_RETRY)"
      echo ""
      
      if command -v gum &> /dev/null; then
        OTP_CODE=$(gum input --placeholder "请输入 6 位验证码")
      else
        read -p "请输入 6 位验证码: " OTP_CODE
      fi
      
      if [ -z "$OTP_CODE" ]; then
        gum style --foreground 196 "❌ 验证码不能为空"
        exit 1
      fi
      
      gum style --foreground 245 "🔄 重新尝试发布..."
      echo ""
    else
      break
    fi
  else
    break
  fi
done

if [ "$publish_success" = false ]; then
  echo ""
  gum style --foreground 196 "❌ 发布失败"
  echo ""
  gum style --foreground 214 "💡 可能的原因:"
  
  if grep -q "EOTP" /tmp/npm-publish.log; then
    gum style --foreground 214 "   • OTP 验证码错误或已过期"
    gum style --foreground 214 "   • 请重新运行: ./publish.sh --otp=YOUR_CODE"
  elif grep -q "403" /tmp/npm-publish.log; then
    gum style --foreground 214 "   • 没有发布权限，包名可能已被占用"
    gum style --foreground 214 "   • 如果是首次发布 @uniky/core，需要创建组织或修改包名"
  elif grep -q "You must be logged in" /tmp/npm-publish.log; then
    gum style --foreground 214 "   • 登录已过期，请重新运行脚本登录"
  elif grep -q "404" /tmp/npm-publish.log; then
    gum style --foreground 214 "   • 包名不存在或需要先创建组织"
    gum style --foreground 214 "   • 访问 https://www.npmjs.com/org/create 创建 @uniky 组织"
  else
    gum style --foreground 214 "   • 版本号可能已存在"
    gum style --foreground 214 "   • 网络连接问题"
  fi
  
  echo ""
  gum style --foreground 245 "📋 完整错误日志: /tmp/npm-publish.log"
  exit 1
fi

echo ""
gum style --bold --foreground 82 "🎉 发布成功!"
gum style --foreground 82 "📦 包名: $package_name"
gum style --foreground 82 "🏷️  版本: v$new_version"
gum style --foreground 82 "🔗 查看: https://www.npmjs.com/package/$package_name"
echo ""

if gum confirm "是否自动提交到 git?" --default=false; then
  git add .
  git commit -m "chore: release v$new_version"
  git tag "v$new_version"

  if gum confirm "是否推送到远程仓库?" --default=false; then
    git push && git push --tags
    gum style --foreground 82 "✅ 已推送到远程仓库"
  fi
else
  echo ""
  gum style --foreground 245 "📝 建议手动执行以下命令提交版本更新:"
  gum style --foreground 245 "   git add ."
  gum style --foreground 245 "   git commit -m \"chore: release v$new_version\""
  gum style --foreground 245 "   git tag v$new_version"
  gum style --foreground 245 "   git push && git push --tags"
fi
