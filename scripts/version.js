#!/usr/bin/env node

/**
 * 版本管理脚本
 * 用法: node scripts/version.js [major|minor|patch|current]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ ${message}`, 'red');
  process.exit(1);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// 读取 package.json
const packagePath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(packagePath)) {
  error('找不到 package.json 文件');
}

const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
const currentVersion = packageJson.version;

// 解析版本号
function parseVersion(version) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) {
    error(`无效的版本号格式: ${version}`);
  }
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
  };
}

// 计算新版本号
function bumpVersion(version, type) {
  const v = parseVersion(version);
  
  switch (type) {
    case 'major':
      v.major += 1;
      v.minor = 0;
      v.patch = 0;
      break;
    case 'minor':
      v.minor += 1;
      v.patch = 0;
      break;
    case 'patch':
      v.patch += 1;
      break;
    default:
      error(`无效的版本类型: ${type} (应为 major, minor 或 patch)`);
  }
  
  return `${v.major}.${v.minor}.${v.patch}`;
}

// 更新 package.json
function updatePackageJson(newVersion) {
  packageJson.version = newVersion;
  fs.writeFileSync(
    packagePath,
    JSON.stringify(packageJson, null, 2) + '\n',
    'utf-8'
  );
  success(`已更新 package.json 版本号为 ${newVersion}`);
}

// 获取 Git 提交信息
function getCommitsSinceLastTag() {
  try {
    const lastTag = execSync('git describe --tags --abbrev=0 2>/dev/null', {
      encoding: 'utf-8',
    }).trim();
    
    const commits = execSync(`git log ${lastTag}..HEAD --oneline`, {
      encoding: 'utf-8',
    }).trim();
    
    return { lastTag, commits };
  } catch (e) {
    // 没有标签
    const commits = execSync('git log --oneline', {
      encoding: 'utf-8',
    }).trim();
    
    return { lastTag: null, commits };
  }
}

// 生成 Changelog
function generateChangelog() {
  const { lastTag, commits } = getCommitsSinceLastTag();
  
  if (!commits) {
    info('没有新的提交');
    return;
  }
  
  console.log('\n📝 变更记录:');
  console.log('─'.repeat(50));
  
  if (lastTag) {
    info(`自 ${lastTag} 以来的提交:`);
  } else {
    info('所有提交:');
  }
  
  console.log(commits);
  console.log('─'.repeat(50) + '\n');
}

// 主函数
function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'current';
  
  info(`当前版本: v${currentVersion}`);
  
  switch (command) {
    case 'current':
      // 只显示当前版本
      generateChangelog();
      break;
      
    case 'major':
    case 'minor':
    case 'patch':
      const newVersion = bumpVersion(currentVersion, command);
      info(`新版本: v${newVersion}`);
      updatePackageJson(newVersion);
      generateChangelog();
      
      console.log('\n下一步:');
      console.log('1. 检查更改: git diff package.json');
      console.log('2. 提交更改: git add package.json && git commit -m "chore: bump version to v' + newVersion + '"');
      console.log('3. 创建标签: git tag -a v' + newVersion + ' -m "Release v' + newVersion + '"');
      console.log('4. 推送代码: git push && git push --tags');
      console.log('\n或者使用发布脚本: ./scripts/release.sh ' + command);
      break;
      
    default:
      error(`未知命令: ${command}\n用法: node scripts/version.js [major|minor|patch|current]`);
  }
}

main();

