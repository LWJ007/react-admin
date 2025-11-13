# 路由配置系统使用说明

## 📋 概述

本项目已将路由系统重构为 **JSON 配置驱动** 的方式，通过配置文件管理所有路由，使路由更加灵活、可维护。

## 🏗️ 架构设计

```
routes.config.ts (路由配置)
       ↓
RouteRenderer.tsx (路由渲染器)
       ↓
index.tsx (根路由组件)
```

## 📁 文件说明

### 1. `routes.config.ts` - 路由配置文件

定义所有路由的配置信息，包括：
- 路由路径
- 组件路径
- 布局类型
- 权限守卫
- 元信息（标题、图标等）

### 2. `RouteRenderer.tsx` - 路由渲染器

根据配置动态生成 React Router 组件树，处理：
- 组件懒加载
- 布局包裹
- 权限守卫包裹
- 重定向逻辑

### 3. `index.tsx` - 根路由组件

简化后的根组件，只负责：
- 用户状态恢复
- 调用路由渲染器

## 🚀 如何添加新路由

### 示例 1：添加普通页面

```typescript
// 1. 在 routes.config.ts 的 routesConfig 中添加配置
{
  path: "dashboard",
  component: "../pages/Dashboard",
  meta: {
    title: "仪表盘",
    icon: "DashboardOutlined",
  },
}

// 2. 在 componentMap 中添加组件映射
export const componentMap = {
  // ...其他映射
  "../pages/Dashboard": () => import("../pages/Dashboard"),
};
```

### 示例 2：添加需要权限验证的页面

```typescript
{
  path: "system/settings",
  component: "../pages/System/Settings",
  auth: "noPower", // 需要权限验证
  meta: {
    title: "系统设置",
    icon: "SettingOutlined",
  },
}
```

### 示例 3：添加带子路由的页面

```typescript
{
  path: "products",
  component: "../pages/Products",
  meta: {
    title: "产品管理",
    icon: "ShoppingOutlined",
  },
  children: [
    {
      path: "list",
      component: "../pages/Products/List",
      meta: {
        title: "产品列表",
      },
    },
    {
      path: "add",
      component: "../pages/Products/Add",
      meta: {
        title: "添加产品",
      },
    },
  ],
}
```

## 🔐 权限守卫类型

| 类型 | 说明 | 使用场景 |
|------|------|---------|
| `"noLogin"` | 未登录用户不能访问 | 主应用区域 |
| `"withLogin"` | 已登录用户不能访问 | 登录页 |
| `"noPower"` | 需要权限验证 | 系统管理页面 |
| `"none"` | 无权限验证 | 公开页面 |

## 🎨 布局类型

| 类型 | 说明 | 组件 |
|------|------|------|
| `"basic"` | 主布局（带侧边栏、头部） | BasicLayout |
| `"user"` | 用户页布局（简洁布局） | UserLayout |
| `"none"` | 无布局 | - |

## 📝 RouteConfig 接口说明

```typescript
interface RouteConfig {
  path: string;              // 路由路径（必填）
  component?: string;        // 组件路径（可选）
  redirect?: string;         // 重定向路径（可选）
  layout?: "basic" | "user" | "none"; // 布局类型（可选）
  auth?: AuthType;          // 权限守卫类型（可选）
  meta?: {                  // 元信息（可选）
    title?: string;         // 页面标题
    icon?: string;          // 图标
    hidden?: boolean;       // 是否在菜单中隐藏
    [key: string]: any;     // 其他自定义字段
  };
  children?: RouteConfig[]; // 子路由（可选）
}
```

## 🔄 路由渲染流程

```
1. 读取 routesConfig 配置
   ↓
2. 遍历配置数组
   ↓
3. 判断路由类型
   ├─ 重定向 → 生成 <Navigate> 组件
   ├─ 普通路由 → 加载组件 + 包裹权限守卫
   ├─ 布局路由 → 加载布局 + 包裹权限守卫 + 递归渲染子路由
   └─ 嵌套路由 → 递归渲染子路由
   ↓
4. 生成 React Router 组件树
```

## ⚙️ 高级用法

### 1. 动态路由

```typescript
// 可以根据后端返回的数据动态生成路由配置
const dynamicRoutes = await fetchRoutesFromAPI();
const finalRoutes = [...routesConfig, ...dynamicRoutes];
```

### 2. 路由元信息

```typescript
// 可以在 meta 中存储任意信息
{
  path: "users",
  component: "../pages/Users",
  meta: {
    title: "用户管理",
    icon: "UserOutlined",
    keepAlive: true,        // 是否缓存
    breadcrumb: false,      // 是否显示面包屑
    permissions: ["user:view"], // 权限标识
  },
}
```

### 3. 路由守卫扩展

如需添加新的守卫类型，在 `RouteRenderer.tsx` 中修改 `wrapWithAuth` 函数：

```typescript
function wrapWithAuth(element: JSX.Element, authType?: AuthType): JSX.Element {
  switch (authType) {
    case "noLogin":
      return <AuthNoLogin>{element}</AuthNoLogin>;
    case "withLogin":
      return <AuthWithLogin>{element}</AuthWithLogin>;
    case "noPower":
      return <AuthNoPower>{element}</AuthNoPower>;
    case "custom": // 新增自定义守卫
      return <CustomAuth>{element}</CustomAuth>;
    default:
      return element;
  }
}
```

## 🎯 优势对比

### 重构前（硬编码）

```tsx
<Routes>
  <Route path="/user" element={<AuthWithLogin><UserLayout /></AuthWithLogin>}>
    <Route path="login" element={<Login />} />
  </Route>
  <Route path="/" element={<AuthNoLogin><BasicLayout /></AuthNoLogin>}>
    <Route path="home" element={<Home />} />
    <Route path="system/menuadmin" element={<AuthNoPower><MenuAdmin /></AuthNoPower>} />
    {/* ...更多路由 */}
  </Route>
</Routes>
```

**缺点：**
- ❌ 路由配置分散在 JSX 中
- ❌ 难以维护和扩展
- ❌ 无法动态生成路由
- ❌ 代码冗余

### 重构后（JSON 配置）

```tsx
<Routes>{renderRoutes(routesConfig)}</Routes>
```

**优点：**
- ✅ 配置集中管理
- ✅ 易于维护和扩展
- ✅ 支持动态路由
- ✅ 代码简洁
- ✅ 类型安全

## 📊 性能优化

1. **懒加载**：所有页面组件都通过 `@loadable/component` 实现懒加载
2. **代码分割**：每个页面打包成独立的 chunk
3. **缓存优化**：组件加载后会被缓存

## 🐛 常见问题

### Q1: 添加新路由后页面空白？

**A:** 检查是否在 `componentMap` 中添加了组件映射。

### Q2: 权限验证不生效？

**A:** 确认 `auth` 字段配置正确，并且对应的守卫组件已实现。

### Q3: 子路由无法访问？

**A:** 确保父路由配置了 `children` 字段，并且路径配置正确。

## 📚 参考资料

- [React Router v6 官方文档](https://reactrouter.com/)
- [@loadable/component 文档](https://loadable-components.com/)

