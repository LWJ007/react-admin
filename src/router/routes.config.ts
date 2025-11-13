/**
 * 路由配置文件
 * 使用 JSON 格式定义所有路由
 */

import type { ComponentType } from "react";

// ==================
// 类型定义
// ==================

/**
 * 路由守卫类型
 */
export type AuthType = "noLogin" | "withLogin" | "noPower" | "none";

/**
 * 路由配置项接口
 */
export interface RouteConfig {
  path: string; // 路由路径
  component?: string; // 组件路径（懒加载）
  redirect?: string; // 重定向路径
  layout?: "basic" | "user" | "none"; // 布局类型
  auth?: AuthType; // 权限守卫类型
  meta?: {
    // 路由元信息
    title?: string; // 页面标题
    icon?: string; // 图标
    hidden?: boolean; // 是否在菜单中隐藏
    [key: string]: any;
  };
  children?: RouteConfig[]; // 子路由
}

// ==================
// 路由配置
// ==================

/**
 * 路由配置列表
 */
export const routesConfig: RouteConfig[] = [
  // ==================
  // 用户相关路由（未登录区域）
  // ==================
  {
    path: "/user",
    layout: "user",
    auth: "withLogin", // 已登录用户不能访问
    meta: {
      title: "用户页",
    },
    children: [
      {
        path: "/user",
        redirect: "login",
      },
      {
        path: "login",
        component: "../pages/Login",
        meta: {
          title: "登录",
        },
      },
      {
        path: "*",
        redirect: "login",
      },
    ],
  },

  // ==================
  // 主应用路由（已登录区域）
  // ==================
  {
    path: "/",
    layout: "basic",
    auth: "noLogin", // 未登录用户不能访问
    meta: {
      title: "主应用",
    },
    children: [
      // 首页重定向
      {
        path: "/",
        redirect: "home",
      },

      // 首页
      {
        path: "home",
        component: "../pages/Home",
        meta: {
          title: "首页",
          icon: "HomeOutlined",
        },
      },

      // 系统管理模块
      {
        path: "system/menuadmin",
        component: "../pages/System/MenuAdmin",
        auth: "noPower", // 需要权限验证
        meta: {
          title: "菜单管理",
          icon: "MenuOutlined",
        },
      },
      {
        path: "system/poweradmin",
        component: "../pages/System/PowerAdmin",
        auth: "noPower",
        meta: {
          title: "权限管理",
          icon: "SafetyOutlined",
        },
      },
      {
        path: "system/roleadmin",
        component: "../pages/System/RoleAdmin",
        auth: "noPower",
        meta: {
          title: "角色管理",
          icon: "TeamOutlined",
        },
      },
      {
        path: "system/useradmin",
        component: "../pages/System/UserAdmin",
        auth: "noPower",
        meta: {
          title: "用户管理",
          icon: "UserOutlined",
        },
      },

      // 错误页面
      {
        path: "404",
        component: "../pages/ErrorPages/404",
        meta: {
          title: "404",
          hidden: true,
        },
      },
      {
        path: "401",
        component: "../pages/ErrorPages/401",
        meta: {
          title: "无权限",
          hidden: true,
        },
      },

      // 404 兜底
      {
        path: "*",
        redirect: "404",
      },
    ],
  },
  {
    path: "/demo",
    component: "../pages/Demo",
    auth: "withLogin",
    meta: {
      title: "Demo",
    },
  },
];

// ==================
// 组件懒加载映射
// ==================

/**
 * 组件路径映射表
 * 用于动态导入组件
 */
export const componentMap: Record<
  string,
  () => Promise<{ default: ComponentType<any> }>
> = {
  "../pages/Login": () => import("../pages/Login"),
  "../pages/Home": () => import("../pages/Home"),
  "../pages/System/MenuAdmin": () => import("../pages/System/MenuAdmin"),
  "../pages/System/PowerAdmin": () => import("../pages/System/PowerAdmin"),
  "../pages/System/RoleAdmin": () => import("../pages/System/RoleAdmin"),
  "../pages/System/UserAdmin": () => import("../pages/System/UserAdmin"),
  "../pages/ErrorPages/404": () => import("../pages/ErrorPages/404"),
  "../pages/ErrorPages/401": () => import("../pages/ErrorPages/401"),
  "../pages/Demo": () => import("../pages/Demo"),
};

// ==================
// 布局组件映射
// ==================

/**
 * 布局组件映射表
 */
export const layoutMap: Record<
  string,
  () => Promise<{ default: ComponentType<any> }>
> = {
  basic: () => import("../layouts/BasicLayout"),
  user: () => import("../layouts/UserLayout"),
};
