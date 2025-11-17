# 🚀 GitHub Actions 使用指南

## ✅ 问题已修复

**原始错误：**
```
This request has been automatically failed because it uses a deprecated version of 
`actions/upload-artifact: v3`. Learn more: https://github.blog/changelog/2024-04-16-deprecation-notice-v3-of-the-artifact-actions/
```

**解决方案：**
已将所有弃用的 Actions 更新到最新版本：
- ✅ `actions/upload-artifact` v3 → v4
- ✅ `actions/cache` v3 → v4  
- ✅ `peaceiris/actions-gh-pages` v3 → v4

---

## 📋 工作流概览

### 1️⃣ CI 工作流 (持续集成)

**文件位置：** `.github/workflows/ci.yml`

**触发条件：**
```bash
# 推送到 main 或 develop 分支
git push origin main
git push origin develop

# 或创建 Pull Request
```

**执行步骤：**
1. 检出代码
2. 设置 Node.js 20.19.3 环境
3. 安装 pnpm 并缓存依赖
4. 运行代码格式检查 (`prettier`)
5. 运行 TypeScript 类型检查
6. 构建项目
7. 上传构建产物（保留 7 天）

**查看结果：**
```
https://github.com/<username>/react-admin/actions/workflows/ci.yml
```

---

### 2️⃣ Release 工作流 (自动发布)

**文件位置：** `.github/workflows/release.yml`

**触发条件：**
```bash
# 推送以 v 开头的标签
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

**执行步骤：**
1. 检出代码（包含完整历史）
2. 设置 Node.js 环境并安装依赖
3. 运行代码检查和构建
4. 打包构建产物：
   - `react-admin-dist.tar.gz` (Linux/Mac)
   - `react-admin-dist.zip` (Windows)
5. 生成 Changelog（自动对比上一个标签）
6. 创建 GitHub Release 并上传附件
7. 部署到 GitHub Pages（可选）

**查看结果：**
```
https://github.com/<username>/react-admin/releases
```

---

## 🎯 快速开始

### 方式一：使用 npm 脚本（推荐）

```bash
# 发布补丁版本 (1.0.0 -> 1.0.1)
npm run release:patch

# 发布次版本 (1.0.0 -> 1.1.0)
npm run release:minor

# 发布主版本 (1.0.0 -> 2.0.0)
npm run release:major
```

### 方式二：手动发布

```bash
# 1. 更新版本号
npm version patch  # 或 minor / major

# 2. 推送代码和标签
git push origin main
git push origin --tags
```

---

## 🔧 首次配置

### 1. 启用 GitHub Actions

1. 进入仓库 **Settings** → **Actions** → **General**
2. 选择 **Allow all actions and reusable workflows**
3. 点击 **Save**

### 2. 配置工作流权限

1. 进入 **Settings** → **Actions** → **General**
2. 找到 **Workflow permissions**
3. 选择 **Read and write permissions**
4. 勾选 **Allow GitHub Actions to create and approve pull requests**
5. 点击 **Save**

### 3. 启用 GitHub Pages（可选）

1. 进入 **Settings** → **Pages**
2. **Source** 选择 **Deploy from a branch**
3. **Branch** 选择 `gh-pages`，目录选择 `/ (root)`
4. 点击 **Save**

访问地址：`https://<username>.github.io/react-admin`

---

## 📊 监控和调试

### 查看工作流运行状态

```
https://github.com/<username>/react-admin/actions
```

### 查看构建日志

1. 点击具体的工作流运行
2. 点击左侧的 job 名称
3. 展开每个步骤查看详细日志

### 重新运行失败的工作流

1. 进入失败的工作流
2. 点击右上角 **Re-run jobs**
3. 选择 **Re-run failed jobs** 或 **Re-run all jobs**

---

## 🐛 常见问题

### Q1: 工作流没有触发？

**检查清单：**
- [ ] 是否推送到了正确的分支？
- [ ] 标签格式是否正确（必须是 `v` 开头）？
- [ ] 仓库是否启用了 Actions？
- [ ] 工作流文件是否在 `.github/workflows/` 目录？

### Q2: 权限错误

```
Error: Resource not accessible by integration
```

**解决方法：**
1. 进入 **Settings** → **Actions** → **General**
2. 设置 **Workflow permissions** 为 **Read and write permissions**

### Q3: 构建失败

**调试步骤：**
```bash
# 本地运行相同的命令
npm run prettier
npx tsc --noEmit
npm run build
```

### Q4: 如何取消正在运行的工作流？

1. 进入 **Actions** 页面
2. 点击正在运行的工作流
3. 点击右上角 **Cancel workflow**

---

## 📝 版本管理

### 查看当前版本

```bash
npm run version
```

### 更新版本号（不发布）

```bash
npm run version:patch  # 1.0.0 -> 1.0.1
npm run version:minor  # 1.0.0 -> 1.1.0
npm run version:major  # 1.0.0 -> 2.0.0
```

### 删除标签

```bash
# 删除本地标签
git tag -d v1.0.0

# 删除远程标签
git push origin :refs/tags/v1.0.0
```

---

## 🔗 相关文档

- [发布指南](./RELEASE.md)
- [Actions 版本说明](../.github/ACTIONS_VERSIONS.md)
- [GitHub Actions 官方文档](https://docs.github.com/en/actions)

---

## ✨ 最佳实践

1. **在 main 分支发布**
   - 确保代码已经过测试
   - 避免在功能分支直接发布

2. **遵循语义化版本**
   - 破坏性更新 → major
   - 新功能 → minor
   - Bug 修复 → patch

3. **编写清晰的提交信息**
   - 使用约定式提交格式
   - 便于自动生成 Changelog

4. **测试后再发布**
   - 本地构建验证
   - CI 通过后再打标签

---

现在你可以安全地使用 GitHub Actions 进行自动化发布了！🎉

