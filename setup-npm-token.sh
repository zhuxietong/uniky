#!/bin/bash
# 配置 npm token 辅助脚本

set -e

echo "🔧 npm Token 配置助手"
echo ""

# 检查是否安装 gum
if ! command -v gum &> /dev/null; then
  echo "⚠️  未安装 gum，使用基础模式"
  USE_GUM=false
else
  USE_GUM=true
fi

# 检查登录状态
echo "🔐 检查 npm 登录状态..."
if ! npm whoami &> /dev/null; then
  echo "⚠️  未登录 npm"
  echo ""
  echo "请先登录 npm 账号："
  npm login
  
  if ! npm whoami &> /dev/null; then
    echo "❌ 登录失败"
    exit 1
  fi
fi

npm_user=$(npm whoami)
echo "✅ 已登录: $npm_user"
echo ""

# 选择获取方式
echo "📋 获取 npm token 的方式："
echo ""
echo "方式 1: 自动创建新 token（推荐）"
echo "方式 2: 手动输入已有 token"
echo "方式 3: 从网页获取（会打开浏览器）"
echo ""

if [ "$USE_GUM" = true ]; then
  method=$(gum choose "自动创建新 token" "手动输入已有 token" "从网页获取")
else
  read -p "请选择方式 (1/2/3): " method_num
  case $method_num in
    1) method="自动创建新 token" ;;
    2) method="手动输入已有 token" ;;
    3) method="从网页获取" ;;
    *) echo "❌ 无效选择"; exit 1 ;;
  esac
fi

TOKEN=""

case "$method" in
  "自动创建新 token")
    echo ""
    echo "🔄 正在创建新 token..."
    
    # 创建 token 并提取
    token_output=$(npm token create --json 2>&1)
    
    if [ $? -eq 0 ]; then
      TOKEN=$(echo "$token_output" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
      if [ -z "$TOKEN" ]; then
        # 尝试其他格式
        TOKEN=$(echo "$token_output" | grep "npm_" | awk '{print $NF}')
      fi
      
      if [ -n "$TOKEN" ]; then
        echo "✅ Token 创建成功！"
      else
        echo "❌ 无法提取 token，请手动创建"
        echo ""
        echo "请执行: npm token create"
        echo "然后复制生成的 token"
        exit 1
      fi
    else
      echo "❌ 创建失败，可能需要 OTP 验证"
      echo ""
      echo "请手动执行: npm token create"
      echo "然后重新运行此脚本选择 '手动输入已有 token'"
      exit 1
    fi
    ;;
    
  "手动输入已有 token")
    echo ""
    if [ "$USE_GUM" = true ]; then
      TOKEN=$(gum input --placeholder "请输入 npm token (npm_xxx...)")
    else
      read -p "请输入 npm token: " TOKEN
    fi
    
    if [ -z "$TOKEN" ]; then
      echo "❌ Token 不能为空"
      exit 1
    fi
    ;;
    
  "从网页获取")
    echo ""
    echo "🌐 正在打开浏览器..."
    token_url="https://www.npmjs.com/settings/$npm_user/tokens"
    
    if command -v open &> /dev/null; then
      open "$token_url"
    elif command -v xdg-open &> /dev/null; then
      xdg-open "$token_url"
    else
      echo "请手动访问: $token_url"
    fi
    
    echo ""
    echo "📝 在网页中："
    echo "   1. 点击 'Generate New Token'"
    echo "   2. 选择 'Classic Token'"
    echo "   3. 选择 'Automation' 或 'Publish'"
    echo "   4. 复制生成的 token"
    echo ""
    
    if [ "$USE_GUM" = true ]; then
      TOKEN=$(gum input --placeholder "请粘贴 token")
    else
      read -p "请粘贴 token: " TOKEN
    fi
    
    if [ -z "$TOKEN" ]; then
      echo "❌ Token 不能为空"
      exit 1
    fi
    ;;
esac

# 验证 token 格式
if [[ ! $TOKEN =~ ^npm_[a-zA-Z0-9]{36}$ ]]; then
  echo "⚠️  警告: Token 格式可能不正确"
  echo "   标准格式: npm_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
fi

# 选择配置方式
echo ""
echo "📝 选择配置方式："
echo ""
echo "方式 A: 使用环境变量（推荐，更安全）"
echo "方式 B: 写入 .npmrc 文件（不推荐，容易泄露）"
echo ""

if [ "$USE_GUM" = true ]; then
  config_method=$(gum choose "使用环境变量" "写入 .npmrc 文件")
else
  read -p "请选择方式 (A/B): " config_method_char
  case $config_method_char in
    [Aa]) config_method="使用环境变量" ;;
    [Bb]) config_method="写入 .npmrc 文件" ;;
    *) echo "❌ 无效选择"; exit 1 ;;
  esac
fi

case "$config_method" in
  "使用环境变量")
    # 检测 shell 类型
    if [ -n "$ZSH_VERSION" ]; then
      shell_config="$HOME/.zshrc"
    elif [ -n "$BASH_VERSION" ]; then
      shell_config="$HOME/.bash_profile"
    else
      shell_config="$HOME/.profile"
    fi
    
    echo ""
    echo "📝 将添加到: $shell_config"
    echo ""
    
    # 检查是否已存在
    if grep -q "NPM_TOKEN" "$shell_config" 2>/dev/null; then
      echo "⚠️  检测到已有 NPM_TOKEN 配置"
      
      if [ "$USE_GUM" = true ]; then
        if ! gum confirm "是否覆盖现有配置?"; then
          echo "❌ 已取消"
          exit 0
        fi
      else
        read -p "是否覆盖? (y/n): " confirm
        if [[ ! $confirm =~ ^[Yy]$ ]]; then
          echo "❌ 已取消"
          exit 0
        fi
      fi
      
      # 删除旧配置
      sed -i.bak '/export NPM_TOKEN=/d' "$shell_config"
    fi
    
    # 添加新配置
    echo "" >> "$shell_config"
    echo "# npm token for publishing" >> "$shell_config"
    echo "export NPM_TOKEN=$TOKEN" >> "$shell_config"
    
    # 创建/更新 .npmrc
    cat > .npmrc << EOF
//registry.npmjs.org/:_authToken=\${NPM_TOKEN}
registry=https://registry.npmjs.org/
always-auth=true
EOF
    
    echo "✅ 配置已添加到 $shell_config"
    echo ""
    echo "🔄 请执行以下命令使配置生效："
    echo "   source $shell_config"
    echo ""
    echo "或者关闭终端重新打开"
    ;;
    
  "写入 .npmrc 文件")
    cat > .npmrc << EOF
//registry.npmjs.org/:_authToken=$TOKEN
registry=https://registry.npmjs.org/
always-auth=true
EOF
    
    echo "✅ Token 已写入 .npmrc"
    echo ""
    echo "⚠️  重要提示："
    echo "   • 请确保 .npmrc 已添加到 .gitignore"
    echo "   • 不要将此文件提交到 git"
    
    # 检查 .gitignore
    if [ -f ".gitignore" ]; then
      if ! grep -q "\.npmrc" .gitignore; then
        echo ""
        if [ "$USE_GUM" = true ]; then
          if gum confirm "是否自动添加 .npmrc 到 .gitignore?"; then
            echo ".npmrc" >> .gitignore
            echo "✅ 已添加到 .gitignore"
          fi
        else
          read -p "是否自动添加 .npmrc 到 .gitignore? (y/n): " add_ignore
          if [[ $add_ignore =~ ^[Yy]$ ]]; then
            echo ".npmrc" >> .gitignore
            echo "✅ 已添加到 .gitignore"
          fi
        fi
      fi
    fi
    ;;
esac

# 测试配置
echo ""
echo "🧪 测试配置..."

if [ "$config_method" = "使用环境变量" ]; then
  export NPM_TOKEN=$TOKEN
fi

if npm whoami &> /dev/null; then
  echo "✅ 配置成功！当前用户: $(npm whoami)"
else
  echo "⚠️  配置可能有问题，请检查"
fi

echo ""
echo "🎉 设置完成！"
echo ""
echo "📝 后续操作："
echo "   • 测试: npm whoami"
echo "   • 发布: ./publish.sh"
echo "   • 管理 tokens: npm token list"
echo ""