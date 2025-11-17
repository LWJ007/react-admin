# 📦 发布指南

本文档介绍如何发布 React Admin 的新版本。

## 🚀 快速发布

### 方式一: 使用发布脚本 (推荐)

```bash
# 发布补丁版本 (1.0.0 -> 1.0.1)
./scripts/release.sh patch

# 发布次版本 (1.0.0 -> 1.1.0)
./scripts/release.sh minor

# 发布主版本 (1.0.0 -> 2.0.0)
./scripts/release.sh major
```

脚本会自动:
1. ✅ 检查 Git 状态
2. ✅ 更新版本号
3. ✅ 运行代码检查
4. ✅ 构建项目
5. ✅ 提交更改
6. ✅ 创建 Git 标签
7. ✅ 推送到远程仓库

### 方式二: 使用 npm 脚本

```bash
# 查看当前版本和变更记录
npm run version

# 更新版本号 (不会自动发布)
npm run version:patch  # 1.0.0 -> 1.0.1
npm run version:minor  # 1.0.0 -> 1.1.0
npm run version:major  # 1.0.0 -> 2.0.0
```

### 方式三: 手动发布

```bash
# 1. 更新版本号
npm version patch  # 或 minor / major

# 2. 运行检查和构建
npm run prettier
npm run build

# 3. 提交并推送
git push
git push --tags
```

## 📋 版本规范

遵循 [语义化版本 (Semantic Versioning)](https://semver.org/lang/zh-CN/)：

- **主版本号 (Major)**: 不兼容的 API 修改
  - 示例: `1.0.0` → `2.0.0`
  - 使用场景: 重大架构调整、破坏性更新

- **次版本号 (Minor)**: 向下兼容的功能性新增
  - 示例: `1.0.0` → `1.1.0`
  - 使用场景: 新功能、新特性

- **修订号 (Patch)**: 向下兼容的问题修正
  - 示例: `1.0.0` → `1.0.1`
  - 使用场景: Bug 修复、小优化

## 🔄 发布流程

### 1. 准备阶段

```bash
# 确保在正确的分支
git checkout main
git pull origin main

# 确保没有未提交的更改
git status

# 查看自上次发布以来的提交
npm run version
```

### 2. 发布阶段

```bash
# 使用发布脚本 (推荐)
./scripts/release.sh patch

# 或手动执行
npm version patch
git push && git push --tags
```

### 3. 自动化阶段

推送标签后,GitHub Actions 会自动:

1. **运行 CI 检查**
   - 代码格式检查
   - TypeScript 类型检查
   - 项目构建

2. **创建 Release**
   - 生成 Changelog
   - 打包构建产物 (.tar.gz 和 .zip)
   - 上传到 GitHub Releases

3. **部署到 GitHub Pages** (可选)
   - 自动部署到 `gh-pages` 分支
   - 可通过 `https://<username>.github.io/<repo>` 访问

### 4. 验证阶段

发布后检查:

- ✅ [GitHub Actions](../../actions) 构建状态
- ✅ [GitHub Releases](../../releases) 发布页面
- ✅ 下载并测试构建产物

## 🛠️ GitHub Actions 工作流

### CI 工作流 (`.github/workflows/ci.yml`)

**触发条件:**
- 推送到 `main` 或 `develop` 分支
- 向 `main` 或 `develop` 提交 Pull Request

**执行内容:**
- 代码格式检查
- TypeScript 类型检查
- 项目构建
- 上传构建产物 (保留 7 天)

### Release 工作流 (`.github/workflows/release.yml`)

**触发条件:**
- 推送以 `v` 开头的标签 (如 `v1.0.0`)

**执行内容:**
- 安装依赖并构建
- 打包构建产物 (.tar.gz 和 .zip)
- 生成 Changelog
- 创建 GitHub Release
- 部署到 GitHub Pages

## 📝 提交信息规范

建议使用 [约定式提交](https://www.conventionalcommits.org/zh-hans/)：

```
<类型>(<范围>): <描述>

[可选的正文]

[可选的脚注]
```

**类型:**
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具链相关

**示例:**
```bash
git commit -m "feat(router): 添加 JSON 配置路由支持"
git commit -m "fix(login): 修复验证码验证逻辑"
git commit -m "docs: 更新发布指南"
```

## 🔧 故障排查

### 问题: 发布脚本权限不足

```bash
# 给脚本添加执行权限
chmod +x scripts/release.sh
```

### 问题: GitHub Actions 构建失败

1. 检查 [Actions 日志](../../actions)
2. 本地运行相同命令验证
3. 确保 `package.json` 中的脚本正确

### 问题: Release 创建失败

确保仓库设置中:
1. Settings → Actions → General
2. Workflow permissions 设置为 "Read and write permissions"

## 📚 相关资源

- [语义化版本规范](https://semver.org/lang/zh-CN/)
- [约定式提交规范](https://www.conventionalcommits.org/zh-hans/)
- [GitHub Actions 文档](https://docs.github.com/cn/actions)
- [GitHub Releases 文档](https://docs.github.com/cn/repositories/releasing-projects-on-github)

