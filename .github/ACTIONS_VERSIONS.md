# GitHub Actions 版本说明

本文档记录项目中使用的 GitHub Actions 及其版本。

## 📦 当前使用的 Actions

### CI 工作流 (`.github/workflows/ci.yml`)

| Action | 版本 | 用途 |
|--------|------|------|
| `actions/checkout` | v4 | 检出代码 |
| `actions/setup-node` | v4 | 设置 Node.js 环境 |
| `pnpm/action-setup` | v2 | 安装 pnpm |
| `actions/cache` | v4 | 缓存 pnpm store |
| `actions/upload-artifact` | v4 | 上传构建产物 |

### Release 工作流 (`.github/workflows/release.yml`)

| Action | 版本 | 用途 |
|--------|------|------|
| `actions/checkout` | v4 | 检出代码 |
| `actions/setup-node` | v4 | 设置 Node.js 环境 |
| `pnpm/action-setup` | v2 | 安装 pnpm |
| `actions/cache` | v4 | 缓存 pnpm store |
| `softprops/action-gh-release` | v1 | 创建 GitHub Release |
| `peaceiris/actions-gh-pages` | v4 | 部署到 GitHub Pages |

## 🔄 版本更新历史

### 2024-11-17
- ✅ 更新 `actions/upload-artifact` 从 v3 到 v4
  - 原因: v3 已被弃用 ([官方公告](https://github.blog/changelog/2024-04-16-deprecation-notice-v3-of-the-artifact-actions/))
- ✅ 更新 `actions/cache` 从 v3 到 v4
  - 原因: 保持与最新版本同步
- ✅ 更新 `peaceiris/actions-gh-pages` 从 v3 到 v4
  - 原因: 保持与最新版本同步

## 📝 版本选择原则

1. **使用主版本号固定** (如 `v4` 而不是 `v4.1.2`)
   - 自动获取补丁和次版本更新
   - 避免破坏性更改

2. **定期检查更新**
   - 关注 GitHub Actions 官方公告
   - 查看 Dependabot 提示

3. **测试后再更新**
   - 在测试分支验证新版本
   - 确保工作流正常运行

## 🔗 相关资源

- [GitHub Actions 官方文档](https://docs.github.com/en/actions)
- [GitHub Actions Marketplace](https://github.com/marketplace?type=actions)
- [Dependabot 版本更新](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates)

## ⚠️ 弃用警告

如果看到以下警告，请及时更新：

```
This request has been automatically failed because it uses a deprecated version of actions/xxx
```

**解决方法：**
1. 查看错误信息中的链接
2. 更新到推荐的版本
3. 提交并推送更改
4. 验证工作流运行正常

