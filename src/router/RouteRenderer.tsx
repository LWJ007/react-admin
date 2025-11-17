/**
 * 路由渲染器
 * 根据路由配置动态生成路由组件
 */

import React from "react";
import { Route, Navigate } from "react-router-dom";
import loadable, { LoadableComponent } from "@loadable/component";

// ==================
// 组件
// ==================
import { AuthNoLogin, AuthWithLogin, AuthNoPower } from "./AuthProvider";
import Loading from "../components/Loading";

// ==================
// 类型
// ==================
import type { RouteConfig, AuthType } from "./routes.config";
import { componentMap, layoutMap } from "./routes.config";

// ==================
// 工具函数
// ==================

/**
 * 根据组件路径获取懒加载组件
 * @param componentPath 组件路径
 * @returns 懒加载组件
 */
function getLazyComponent(componentPath: string): LoadableComponent<any> {
  const importFunc = componentMap[componentPath];

  if (!importFunc) {
    console.error(`组件路径 "${componentPath}" 未在 componentMap 中定义`);
    // 返回一个错误组件
    return loadable(() => import("../pages/ErrorPages/404"), {
      fallback: <Loading />,
    });
  }

  return loadable(importFunc as any, {
    fallback: <Loading />,
  });
}

/**
 * 根据布局类型获取布局组件
 * @param layoutType 布局类型
 * @returns 布局组件
 */
function getLayoutComponent(layoutType: string): LoadableComponent<any> | null {
  const importFunc = layoutMap[layoutType];

  if (!importFunc) {
    console.error(`布局类型 "${layoutType}" 未在 layoutMap 中定义`);
    return null;
  }

  return loadable(importFunc as any, {
    fallback: <Loading />,
  });
}

/**
 * 根据权限类型包裹组件
 * @param element 要包裹的元素
 * @param authType 权限类型
 * @returns 包裹后的元素
 */
function wrapWithAuth(element: JSX.Element, authType?: AuthType): JSX.Element {
  if (!authType || authType === "none") {
    return element;
  }

  switch (authType) {
    case "noLogin":
      return <AuthNoLogin>{element}</AuthNoLogin>;
    case "withLogin":
      return <AuthWithLogin>{element}</AuthWithLogin>;
    case "noPower":
      return <AuthNoPower>{element}</AuthNoPower>;
    default:
      return element;
  }
}

// ==================
// 路由渲染器组件
// ==================

interface RouteRendererProps {
  routes: RouteConfig[];
}

/**
 * 递归渲染路由配置
 * @param routes 路由配置数组
 * @returns Route 组件数组
 */
export function renderRoutes(routes: RouteConfig[]): JSX.Element[] {
  return routes.map((route, index) => {
    const key = `${route.path}-${index}`;

    // ==================
    // 处理重定向
    // ==================
    if (route.redirect) {
      return (
        <Route
          key={key}
          path={route.path}
          element={<Navigate to={route.redirect} replace />}
        />
      );
    }

    // ==================
    // 处理普通路由（有组件）
    // ==================
    if (route.component) {
      const Component = getLazyComponent(route.component);
      const element = <Component />;
      const wrappedElement = wrapWithAuth(element, route.auth);

      // 如果有子路由，不渲染当前组件
      if (route.children && route.children.length > 0) {
        return (
          <Route key={key} path={route.path} element={wrappedElement}>
            {renderRoutes(route.children)}
          </Route>
        );
      }

      return <Route key={key} path={route.path} element={wrappedElement} />;
    }

    // ==================
    // 处理布局路由（有布局和子路由）
    // ==================
    if (route.layout && route.children) {
      const LayoutComponent = getLayoutComponent(route.layout);

      if (!LayoutComponent) {
        // 如果布局组件不存在，直接渲染子路由
        return (
          <Route key={key} path={route.path}>
            {renderRoutes(route.children)}
          </Route>
        );
      }

      const layoutElement = <LayoutComponent />;
      const wrappedLayout = wrapWithAuth(layoutElement, route.auth);

      return (
        <Route key={key} path={route.path} element={wrappedLayout}>
          {renderRoutes(route.children)}
        </Route>
      );
    }

    // ==================
    // 处理只有子路由的情况
    // ==================
    if (route.children && route.children.length > 0) {
      return (
        <Route key={key} path={route.path}>
          {renderRoutes(route.children)}
        </Route>
      );
    }

    // ==================
    // 兜底：空路由
    // ==================
    console.warn(`路由配置不完整: ${route.path}`, route);
    return (
      <Route key={key} path={route.path} element={<div>路由配置错误</div>} />
    );
  });
}

/**
 * 路由渲染器组件
 */
export default function RouteRenderer({
  routes,
}: RouteRendererProps): JSX.Element {
  return <>{renderRoutes(routes)}</>;
}
