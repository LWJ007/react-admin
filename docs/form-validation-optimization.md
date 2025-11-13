# Ant Design Form 表单校验优化方案

## 📊 当前实现 vs 推荐实现

### 当前实现（手动触发校验）

```tsx
// ❌ 当前代码
<Form form={form}>
  <Form.Item name="username" rules={[...]}>
    <Input onPressEnter={onSubmit} />
  </Form.Item>
  
  <Form.Item name="password" rules={[...]}>
    <Input type="password" onPressEnter={onSubmit} />
  </Form.Item>
  
  <Form.Item name="vcode" rules={[...]}>
    <Input onPressEnter={onSubmit} />
  </Form.Item>
  
  <Button onClick={onSubmit} loading={loading}>登录</Button>
</Form>

const onSubmit = async (): Promise<void> => {
  try {
    const values = await form.validateFields();  // 手动触发校验
    setLoading(true);
    const res = await loginIn(values.username, values.password);
    // ...
  } catch (e) {
    // 验证未通过
  }
};
```

**问题：**
- ❌ 需要手动调用 `validateFields()`
- ❌ 每个输入框都要绑定 `onPressEnter`
- ❌ 代码重复
- ❌ 不符合 HTML 表单语义

---

### 推荐实现（自动触发校验）

```tsx
// ✅ 推荐代码
<Form form={form} onFinish={onSubmit} onFinishFailed={onSubmitFailed}>
  <Form.Item name="username" rules={[...]}>
    <Input />  {/* 不需要 onPressEnter */}
  </Form.Item>
  
  <Form.Item name="password" rules={[...]}>
    <Input type="password" />
  </Form.Item>
  
  <Form.Item name="vcode" rules={[...]}>
    <Input />
  </Form.Item>
  
  <Button htmlType="submit" loading={loading}>登录</Button>
</Form>

const onSubmit = async (values: any): Promise<void> => {
  // values 已经是校验通过的数据
  setLoading(true);
  const res = await loginIn(values.username, values.password);
  // ...
};

const onSubmitFailed = (errorInfo: any): void => {
  console.log('校验失败:', errorInfo);
};
```

**优点：**
- ✅ 不需要手动调用 `validateFields()`
- ✅ 不需要在每个输入框绑定 `onPressEnter`
- ✅ 按回车键自动提交（Form 的默认行为）
- ✅ 代码更简洁
- ✅ 符合 HTML 表单语义
- ✅ 更好的错误处理

---

## 🔄 自动校验的触发时机

### 1. 默认触发时机

```tsx
<Form.Item
  name="username"
  rules={[{ required: true, message: '请输入用户名' }]}
>
  <Input />
</Form.Item>
```

**自动触发时机：**
- ✅ **onChange** - 用户输入时
- ✅ **onBlur** - 失去焦点时
- ✅ **onSubmit** - 提交表单时

---

### 2. 自定义触发时机

```tsx
<Form.Item
  name="username"
  rules={[{ required: true, message: '请输入用户名' }]}
  validateTrigger="onBlur"  // 只在失去焦点时校验
>
  <Input />
</Form.Item>
```

**可选值：**
- `"onChange"` - 输入时校验
- `"onBlur"` - 失去焦点时校验
- `["onChange", "onBlur"]` - 多个时机
- `false` - 禁用自动校验（只在提交时校验）

---

### 3. 禁用自动校验

```tsx
<Form.Item
  name="username"
  rules={[{ required: true, message: '请输入用户名' }]}
  validateTrigger={false}  // 禁用自动校验
>
  <Input />
</Form.Item>
```

**效果：**
- 输入时不校验
- 失去焦点时不校验
- 只在提交表单时校验

---

## 💡 手动触发校验的场景

虽然推荐使用自动校验，但以下场景需要手动触发：

### 场景1：动态校验

```tsx
const checkUsername = async () => {
  try {
    // 只校验用户名字段
    const values = await form.validateFields(['username']);
    
    // 调用后端接口检查用户名是否存在
    const exists = await checkUsernameExists(values.username);
    
    if (exists) {
      form.setFields([{
        name: 'username',
        errors: ['用户名已存在']
      }]);
    }
  } catch (e) {
    console.log('校验失败');
  }
};

<Input onBlur={checkUsername} />
```

---

### 场景2：分步表单

```tsx
const nextStep = async () => {
  try {
    // 只校验当前步骤的字段
    await form.validateFields(['username', 'password']);
    setStep(2);  // 进入下一步
  } catch (e) {
    message.error('请完善当前步骤的信息');
  }
};
```

---

### 场景3：自定义提交逻辑

```tsx
const onSubmit = async () => {
  try {
    // 先校验表单
    const values = await form.validateFields();
    
    // 自定义逻辑：弹出确认框
    const confirmed = await showConfirm('确认提交？');
    if (!confirmed) return;
    
    // 提交数据
    await submitData(values);
  } catch (e) {
    console.log('校验失败');
  }
};
```

---

## 🎯 最佳实践

### 1. 优先使用 Form.onFinish

```tsx
// ✅ 推荐
<Form onFinish={onSubmit}>
  <Button htmlType="submit">提交</Button>
</Form>

// ❌ 不推荐
<Form>
  <Button onClick={async () => {
    const values = await form.validateFields();
    onSubmit(values);
  }}>提交</Button>
</Form>
```

---

### 2. 合理设置 validateTrigger

```tsx
// 实时反馈（适合简单校验）
<Form.Item
  name="username"
  rules={[{ required: true }]}
  validateTrigger="onChange"
>
  <Input />
</Form.Item>

// 延迟反馈（适合复杂校验，避免频繁提示）
<Form.Item
  name="email"
  rules={[{ type: 'email', message: '邮箱格式不正确' }]}
  validateTrigger="onBlur"
>
  <Input />
</Form.Item>
```

---

### 3. 使用 onFinishFailed 处理错误

```tsx
<Form
  onFinish={onSubmit}
  onFinishFailed={(errorInfo) => {
    console.log('校验失败:', errorInfo);
    message.error('请检查表单信息');
  }}
>
  {/* 表单项 */}
</Form>
```

---

## 📋 完整示例

### 优化后的登录表单

```tsx
import React, { useState } from "react";
import { Form, Input, Button, Checkbox, message } from "antd";
import { UserOutlined, KeyOutlined } from "@ant-design/icons";

function LoginForm() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 提交成功时调用（已通过校验）
  const onFinish = async (values: any) => {
    console.log('表单数据:', values);
    setLoading(true);
    
    try {
      const res = await loginIn(values.username, values.password);
      if (res.status === 200) {
        message.success('登录成功');
        navigate('/');
      } else {
        message.error(res.message);
      }
    } catch (e) {
      message.error('登录失败');
    } finally {
      setLoading(false);
    }
  };

  // 提交失败时调用（校验未通过）
  const onFinishFailed = (errorInfo: any) => {
    console.log('校验失败:', errorInfo);
    message.error('请检查表单信息');
  };

  return (
    <Form
      form={form}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
    >
      <Form.Item
        name="username"
        rules={[
          { required: true, message: '请输入用户名' },
          { max: 12, message: '最大长度为12位字符' },
        ]}
        validateTrigger="onBlur"  // 失去焦点时校验
      >
        <Input
          prefix={<UserOutlined />}
          placeholder="请输入用户名"
        />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[
          { required: true, message: '请输入密码' },
          { max: 18, message: '最大长度18个字符' },
        ]}
        validateTrigger="onBlur"
      >
        <Input.Password
          prefix={<KeyOutlined />}
          placeholder="请输入密码"
        />
      </Form.Item>

      <Form.Item
        name="remember"
        valuePropName="checked"
      >
        <Checkbox>记住密码</Checkbox>
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          block
        >
          {loading ? '登录中...' : '登录'}
        </Button>
      </Form.Item>
    </Form>
  );
}
```

---

## 🔧 API 参考

### Form 组件

| 属性 | 说明 | 类型 | 默认值 |
|-----|------|------|--------|
| `onFinish` | 提交表单且数据验证成功后回调 | `(values) => void` | - |
| `onFinishFailed` | 提交表单且数据验证失败后回调 | `(errorInfo) => void` | - |
| `validateTrigger` | 统一设置字段校验规则 | `string \| string[]` | `onChange` |

### Form.Item 组件

| 属性 | 说明 | 类型 | 默认值 |
|-----|------|------|--------|
| `name` | 字段名 | `string` | - |
| `rules` | 校验规则 | `Rule[]` | - |
| `validateTrigger` | 设置字段校验的时机 | `string \| string[] \| false` | `onChange` |

### Form 实例方法

| 方法 | 说明 | 类型 |
|-----|------|------|
| `validateFields` | 触发表单验证 | `(nameList?: NamePath[]) => Promise` |
| `setFieldsValue` | 设置表单的值 | `(values) => void` |
| `getFieldsValue` | 获取表单的值 | `(nameList?: NamePath[]) => any` |
| `resetFields` | 重置表单 | `(fields?: NamePath[]) => void` |

---

## 📚 总结

### 何时使用自动校验？

- ✅ 普通表单提交
- ✅ 简单的校验规则
- ✅ 不需要复杂的提交前逻辑

### 何时使用手动校验？

- ✅ 分步表单
- ✅ 需要动态校验（如检查用户名是否存在）
- ✅ 需要在校验前后执行复杂逻辑
- ✅ 需要部分字段校验

### 推荐做法

1. **优先使用 `Form.onFinish`** - 代码更简洁
2. **合理设置 `validateTrigger`** - 平衡用户体验和性能
3. **使用 `onFinishFailed`** - 统一处理校验失败
4. **按钮使用 `htmlType="submit"`** - 符合 HTML 语义
5. **移除不必要的 `onPressEnter`** - Form 会自动处理回车提交

