import React, {
  useId,
  useEffect,
  useRef,
  useState,
  useMemo,
  useLayoutEffect,
} from "react";
import { Button, Checkbox, Form, Input } from "antd";
// 倒计时hook
const useCountdown = (initialTime: number) => {
  const [time, setTime] = useState(initialTime);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 如果时间已经到0或负数，不启动定时器
    if (initialTime <= 0) {
      return;
    }

    timerRef.current = setInterval(() => {
      setTime((prev) => {
        // 倒计时到0时停止
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [initialTime]); // 添加依赖项

  return time;
};
interface CountdownComItemProps {
  initialTime: number;
}
// 使用 React.memo 优化性能，避免父组件重渲染时不必要的子组件渲染
const CountdownComItem = React.memo(
  ({ initialTime }: CountdownComItemProps) => {
    const time = useCountdown(initialTime);

    return (
      <div
        style={{
          padding: "10px",
          margin: "5px 0",
          border: "1px solid #ddd",
          borderRadius: "4px",
          backgroundColor: time === 0 ? "#f0f0f0" : "#fff",
        }}
      >
        倒计时: {time}秒 {time === 0 && "⏰ 时间到！"}
      </div>
    );
  }
);
// 设置 displayName 用于调试
CountdownComItem.displayName = "CountdownComItem";
const CountdownComList = () => {
  const timeArray = [10, 20, 30]; // 改为更短的时间便于测试

  return (
    <div
      style={{
        padding: "20px",
        margin: "20px 0",
        border: "2px solid #52c41a",
        borderRadius: "8px",
        backgroundColor: "#f6ffed",
      }}
    >
      <h3 style={{ marginTop: 0 }}>⏱️ 倒计时组件列表</h3>
      <p style={{ fontSize: "12px", color: "#666" }}>
        💡 提示: 每个倒计时独立运行，使用 React.memo 优化性能
      </p>
      {timeArray.map((item) => (
        <CountdownComItem key={item} initialTime={item} />
      ))}
    </div>
  );
};
// 测试组件：用于验证父组件重新渲染时子组件是否也会重新渲染
function RenderTestComponent() {
  const renderCount = useRef(0);
  // const [renderState, setRenderState] = useState(0);
  renderCount.current += 1;
  const restCount = () => {
    renderCount.current = 0;
    alert(`当前渲染次数: ${renderCount.current}`);
  };
  console.log(`🔄 RenderTestComponent 渲染次数: ${renderCount.current}`);
  return (
    <div
      style={{
        padding: "10px",
        margin: "10px 0",
        border: "2px solid #1890ff",
        borderRadius: "4px",
        backgroundColor: "#e6f7ff",
      }}
    >
      <h3>渲染测试组件</h3>
      <p>
        当前渲染次数: <strong>{renderCount.current}</strong>
      </p>
      <p style={{ fontSize: "12px", color: "#666" }}>
        💡 提示: 如果点击 &quot;Fill form&quot;
        按钮后这个数字增加，说明整个组件重新渲染了
      </p>
      <button onClick={restCount}>测试更新</button>
    </div>
  );
}
// 缓存组件
const MemoRenderTestComponent = React.memo(RenderTestComponent);
function Demo(): JSX.Element {
  // antd form获取
  const [refForm] = Form.useForm();
  // sueRef获取dom
  const inputRef = useRef<HTMLInputElement>(null);
  // 定义不需渲染的引用值
  const scrollTop = useRef(0);
  // 定义渲染的值
  const [scrollTopState, setScrollTopState] = useState(0);
  // 通过form.setFieldsValue修改form值
  const onChangeForm = (value: string) => {
    console.log(`🚀 onChangeForm 被调用，参数: ${value}`);
    switch (value) {
      case "username":
        console.log(refForm, "====refForm====");
        refForm.setFieldsValue({
          username: "lee",
        });
        break;
      case "password":
        refForm.setFieldsValue({
          password: "123456",
        });
        break;
      case "remember":
        break;
    }
  };
  const memoScrollTop = useMemo(() => {
    return scrollTop.current;
  }, [scrollTopState]);
  // 模拟生命周期
  useEffect(() => {
    console.log("====useEffect====");
    inputRef.current?.focus();
    console.log(inputRef.current?.getBoundingClientRect());
    window.addEventListener("scroll", (e) => {
      scrollTop.current = document.documentElement.scrollTop;
      setScrollTopState((prev) => scrollTop.current);
      console.log(scrollTop, "====num====");
    });
    return () => {
      window.removeEventListener("scroll", (e) => {
        console.log(e, "====e.data====");
      });
    };
  }, []);
  const onFinish = (values: any) => {
    console.log("Success:", values);
  };
  const id = useId();
  useEffect(() => {
    console.log(id, scrollTopState, "====id====");
  }, [id, scrollTopState]);
  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };
  const refDiv = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    console.log("====useLayoutEffect====");
    const res = refDiv.current?.getBoundingClientRect();
    console.log(res, "====res====");
  }, []);
  const [heightAuto, setHeightAuto] = useState(false);
  const mouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    console.log(e, "MouseEvent");
    setHeightAuto(true);
  };
  const mouseLeave = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    console.log(e, "mouseleave");
    setHeightAuto(false);
  };
  return (
    <>
      <CountdownComList />
      <input type="text" ref={inputRef} />
      <div
        ref={refDiv}
        onMouseEnter={mouseDown}
        onMouseLeave={mouseLeave}
        style={{
          height: heightAuto ? "100px" : "22px",
          overflow: "hidden",
          transition: "height 0.3s",
        }}
      >
        scrollTopState: {scrollTopState}
      </div>
      <div>memoScrollTop: {memoScrollTop}</div>

      {/* 测试组件 */}
      <RenderTestComponent />
      {/** 缓存组件 **/}
      <MemoRenderTestComponent />
      <Form
        form={refForm}
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          label="Username"
          name="username"
          rules={[{ required: true, message: "Please input your username!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          name="remember"
          valuePropName="checked"
          wrapperCol={{ offset: 8, span: 16 }}
        >
          <Checkbox>Remember me</Checkbox>
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
          <Button
            type="primary"
            htmlType="button"
            onClick={() => onChangeForm("username")}
          >
            Fill form
          </Button>
        </Form.Item>
      </Form>
    </>
  );
}

export default Demo;
