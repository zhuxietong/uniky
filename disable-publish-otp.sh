#!/bin/bash
# 禁用 npm 发布时的 2FA 验证

set -e

echo "🔧 npm 2FA 设置工具"
echo ""

# 检查登录状态
echo "🔐 检查 npm 登录状态..."
if ! npm whoami &> /dev/null; then
  echo "❌ 未登录 npm，请先登录"
  npm login
  exit 1
fi

npm_user=$(npm whoami)
echo "✅ 已登录: $npm_user"
echo ""

# 显示当前 2FA 状态
echo "📋 当前账号设置:"
npm profile get 2>&1
echo ""

# 提示说明
echo "📖 关于 npm 2FA:"
echo ""
echo "   npm 的 2FA 设置现在只能通过网页管理"
echo "   命令行已不再支持直接修改 2FA 模式"
echo ""
echo "🌐 请按以下步骤操作:"
echo ""
echo "   1. 访问 npm 账号设置页面"
echo "   2. 找到 'Two-Factor Authentication' 设置"
echo "   3. 修改为 'Authorization only' (仅登录需要 2FA)"
echo "   4. 保存设置"
echo ""

# 确认是否打开浏览器
read -p "是否现在打开浏览器进行设置? (y/n): " confirm

if [[ $confirm =~ ^[Yy]$ ]]; then
  settings_url="https://www.npmjs.com/settings/$npm_user/profile"
  
  echo ""
  echo "🌐 正在打开浏览器..."
  
  if command -v open &> /dev/null; then
    open "$settings_url"
  elif command -v xdg-open &> /dev/null; then
    xdg-open "$settings_url"
  else
    echo "请手动访问: $settings_url"
  fi
  
  echo ""
  echo "📝 在网页中找到 'Two-Factor Authentication' 部分:"
  echo ""
  echo "   当前设置可能是:"
  echo "   • Authorization and Publishing (登录和发布都需要 2FA) ❌"
  echo ""
  echo "   修改为:"
  echo "   • Authorization Only (仅登录需要 2FA) ✅"
  echo ""
  echo "   这样发布时就不需要 OTP 验证码了！"
  echo ""
  
  read -p "设置完成后按回车键继续..." 
  
  echo ""
  echo "✅ 设置完成！"
  echo ""
  echo "🎉 现在可以直接运行发布脚本:"
  echo "   ./publish.sh"
  echo ""
else
  echo ""
  echo "💡 提示:"
  echo "   请访问: https://www.npmjs.com/settings/$npm_user/profile"
  echo "   找到 'Two-Factor Authentication' 设置"
  echo "   修改为 'Authorization Only' 模式"
  echo ""
fi

echo "📌 其他信息:"
echo "   • Token 配置: .npmrc 已配置"
echo "   • 修改后立即生效，无需重新登录"
echo "   • 登录时仍然需要 2FA，保证账号安全"
echo ""