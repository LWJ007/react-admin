/** 根路由 **/

// ==================
// 第三方库
// ==================
import React, { useEffect } from "react";
import { Routes } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { message } from "antd";

// ==================
// 自定义的东西
// ==================
import tools from "@/util/tools";

// ==================
// 路由配置和渲染器
// ==================
import { routesConfig } from "./routes.config";
import { renderRoutes } from "./RouteRenderer";

// ==================
// 类型声明
// ==================
import { RootState, Dispatch } from "@/store";

// 全局提示只显示2秒
message.config({
  duration: 2,
});

// ==================
// 本组件
// ==================
function RouterCom(): JSX.Element {
  const dispatch = useDispatch<Dispatch>();
  const userinfo = useSelector((state: RootState) => state.app.userinfo);

  useEffect(() => {
    const userTemp = sessionStorage.getItem("userinfo");
    /**
     * sessionStorage中有user信息，但store中没有
     * 说明刷新了页面，需要重新同步user数据到store
     * **/
    if (userTemp && !userinfo.userBasicInfo) {
      dispatch.app.setUserInfo(JSON.parse(tools.uncompile(userTemp)));
    }
  }, [dispatch.app, userinfo.userBasicInfo]);

  return <Routes>{renderRoutes(routesConfig)}</Routes>;
}

export default RouterCom;
