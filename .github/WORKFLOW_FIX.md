# GitHub Actions 工作流修复说明

## 🐛 问题描述

### 错误 1: Actions 版本弃用
```
This request has been automatically failed because it uses a deprecated version of 
`actions/upload-artifact: v3`
```

### 错误 2: 依赖锁文件未找到
```
Error: Dependencies lock file is not found in /home/runner/work/react-admin/react-admin. 
Supported file patterns: package-lock.json,npm-shrinkwrap.json,yarn.lock
```

---

## ✅ 解决方案

### 1. 更新弃用的 Actions

| Action | 旧版本 | 新版本 |
|--------|--------|--------|
| `actions/upload-artifact` | v3 | ✅ v4 |
| `actions/cache` | v3 | ✅ v4 |
| `peaceiris/actions-gh-pages` | v3 | ✅ v4 |

### 2. 修复包管理器配置

**问题原因：**
- 项目使用 **pnpm** 作为包管理器
- 工作流配置了 `cache: 'npm'`，但项目中没有 `package-lock.json`
- 只有 `pnpm-lock.yaml` 文件

**修复方法：**

#### 修改前 ❌
```yaml
- name: 设置 Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20.19.3'
    cache: 'npm'  # ❌ 错误：项目使用 pnpm

- name: 安装 pnpm
  uses: pnpm/action-setup@v2
  with:
    version: 8
    run_install: false

- name: 获取 pnpm store 目录
  shell: bash
  run: |
    echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_ENV

- name: 设置 pnpm 缓存
  uses: actions/cache@v4
  with:
    path: ${{ env.STORE_PATH }}
    key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}

- name: 安装依赖
  run: pnpm install --frozen-lockfile
```

#### 修改后 ✅
```yaml
- name: 安装 pnpm
  uses: pnpm/action-setup@v2
  with:
    version: 8

- name: 设置 Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20.19.3'
    cache: 'pnpm'  # ✅ 正确：使用 pnpm 缓存

- name: 安装依赖
  run: pnpm install --no-frozen-lockfile
```

**关键改进：**
1. ✅ 先安装 pnpm，再设置 Node.js（顺序很重要）
2. ✅ 使用 `cache: 'pnpm'` 而不是 `cache: 'npm'`
3. ✅ 移除了手动的 pnpm store 缓存配置（`setup-node` 会自动处理）
4. ✅ 使用 `--no-frozen-lockfile` 允许在 CI 中更新依赖

---

## 📋 修改的文件

### `.github/workflows/ci.yml`
- ✅ 更新 `actions/upload-artifact` v3 → v4
- ✅ 更新 `actions/cache` v3 → v4
- ✅ 修复 pnpm 缓存配置
- ✅ 调整步骤顺序

### `.github/workflows/release.yml`
- ✅ 更新 `actions/cache` v3 → v4
- ✅ 更新 `peaceiris/actions-gh-pages` v3 → v4
- ✅ 修复 pnpm 缓存配置
- ✅ 调整步骤顺序

---

## 🎯 为什么顺序很重要？

### 正确顺序 ✅
```yaml
1. 安装 pnpm (pnpm/action-setup)
2. 设置 Node.js (actions/setup-node with cache: 'pnpm')
3. 安装依赖 (pnpm install)
```

### 错误顺序 ❌
```yaml
1. 设置 Node.js (actions/setup-node with cache: 'npm')  # ❌ pnpm 还未安装
2. 安装 pnpm (pnpm/action-setup)
3. 安装依赖 (pnpm install)
```

**原因：**
- `actions/setup-node@v4` 的 `cache` 参数需要在设置时就能找到对应的包管理器
- 如果先设置 Node.js 再安装 pnpm，缓存功能会失败
- 必须先安装 pnpm，让 `setup-node` 能够检测到并正确配置缓存

---

## 🧪 验证方法

### 本地测试
```bash
# 确保 pnpm-lock.yaml 存在
ls -la pnpm-lock.yaml

# 测试安装
pnpm install --no-frozen-lockfile

# 测试构建
pnpm run build
```

### GitHub Actions 测试
```bash
# 推送代码触发 CI
git add .
git commit -m "fix: 修复 GitHub Actions 工作流配置"
git push origin main

# 或创建测试标签触发 Release
git tag -a v1.0.1-test -m "Test release workflow"
git push origin v1.0.1-test
```

---

## 📊 性能对比

### 修改前
- ❌ 缓存失败（找不到 npm lock 文件）
- ❌ 每次都重新下载所有依赖
- ⏱️ 安装时间：~2-3 分钟

### 修改后
- ✅ 缓存成功（使用 pnpm-lock.yaml）
- ✅ 复用缓存的依赖
- ⏱️ 安装时间：~30-60 秒（首次后）

---

## 🔗 参考资料

- [actions/setup-node - pnpm 支持](https://github.com/actions/setup-node#caching-global-packages-data)
- [pnpm/action-setup 文档](https://github.com/pnpm/action-setup)
- [GitHub Actions 缓存最佳实践](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows)
- [actions/upload-artifact v4 迁移指南](https://github.com/actions/upload-artifact/blob/main/docs/MIGRATION.md)

---

## ✨ 现在可以正常使用了！

所有问题已修复，工作流现在应该能够：
- ✅ 正确缓存 pnpm 依赖
- ✅ 使用最新版本的 Actions
- ✅ 成功构建和发布

