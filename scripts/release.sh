#!/bin/bash

# React Admin 发布脚本
# 用法: ./scripts/release.sh [major|minor|patch]

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否在 git 仓库中
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "当前目录不是 git 仓库"
    exit 1
fi

# 检查是否有未提交的更改
if [[ -n $(git status -s) ]]; then
    print_error "存在未提交的更改,请先提交或暂存"
    git status -s
    exit 1
fi

# 检查是否在 main 或 master 分支
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "main" && "$CURRENT_BRANCH" != "master" ]]; then
    print_warn "当前分支是 $CURRENT_BRANCH,建议在 main/master 分支发布"
    read -p "是否继续? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 获取当前版本
CURRENT_VERSION=$(node -p "require('./package.json').version")
print_info "当前版本: v$CURRENT_VERSION"

# 确定版本类型
VERSION_TYPE=${1:-patch}
if [[ ! "$VERSION_TYPE" =~ ^(major|minor|patch)$ ]]; then
    print_error "无效的版本类型: $VERSION_TYPE (应为 major, minor 或 patch)"
    exit 1
fi

# 计算新版本号
IFS='.' read -ra VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR=${VERSION_PARTS[0]}
MINOR=${VERSION_PARTS[1]}
PATCH=${VERSION_PARTS[2]}

case $VERSION_TYPE in
    major)
        MAJOR=$((MAJOR + 1))
        MINOR=0
        PATCH=0
        ;;
    minor)
        MINOR=$((MINOR + 1))
        PATCH=0
        ;;
    patch)
        PATCH=$((PATCH + 1))
        ;;
esac

NEW_VERSION="$MAJOR.$MINOR.$PATCH"
print_info "新版本: v$NEW_VERSION"

# 确认发布
read -p "确认发布 v$NEW_VERSION? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warn "取消发布"
    exit 0
fi

# 更新 package.json 版本号
print_info "更新 package.json 版本号..."
npm version $NEW_VERSION --no-git-tag-version

# 运行代码检查
print_info "运行代码格式化..."
npm run prettier || {
    print_error "代码格式化失败"
    exit 1
}

# 运行构建
print_info "构建项目..."
npm run build || {
    print_error "构建失败"
    exit 1
}

# 提交更改
print_info "提交版本更新..."
git add package.json
git commit -m "chore: release v$NEW_VERSION"

# 创建标签
print_info "创建 Git 标签..."
git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION"

# 推送到远程
print_info "推送到远程仓库..."
git push origin $CURRENT_BRANCH
git push origin "v$NEW_VERSION"

print_info "✅ 发布成功! GitHub Actions 将自动构建并创建 Release"
print_info "查看发布进度: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/actions"

