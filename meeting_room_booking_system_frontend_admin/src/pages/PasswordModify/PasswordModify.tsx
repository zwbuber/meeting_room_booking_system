import { Button, Form, Input, message, Space } from "antd";
import { useForm } from "antd/es/form/Form";
import "./password_modify.css";
import { useEffect } from "react";
import { getUserInfo, updatePassword, updatePasswordCaptcha } from "@/apis/user";

export interface UpdatePassword {
  email: string;
  captcha: string;
  password: string;
  username: string;
  confirmPassword: string;
}

const layout1 = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

export function PasswordModify() {
  const [form] = useForm();

  const onFinish = async (values: UpdatePassword) => {
    if (values.password !== values.confirmPassword) {
      return message.error("两次密码不一致");
    }

    const res = await updatePassword({
      ...values,
      username: form.getFieldValue("username"),
    });

    if (res.success) {
      message.success("密码修改成功");
    } else {
      message.error(res.data || "系统繁忙，请稍后再试");
    }
  };

  const sendCaptcha = async function () {
    const address = form.getFieldValue("email");
    if (!address) {
      return message.error("邮箱地址为空");
    }

    const res = await updatePasswordCaptcha(address);
    if (res.success) {
      message.success(res.data);
    } else {
      message.error("系统繁忙，请稍后再试");
    }
  };

  useEffect(() => {
    async function query() {
      const res = await getUserInfo();

      const { data } = res;

      if (res.success) {
        form.setFieldValue("username", data.username);
        form.setFieldValue("email", data.email);
      }
    }
    query();
  }, []);

  return (
    <div id="updatePassword-container">
      <Form form={form} {...layout1} onFinish={onFinish} colon={false} autoComplete="off">
        <Form.Item label="密码" name="password" rules={[{ required: true, message: "请输入密码!" }]}>
          <Input.Password placeholder="请输入密码" />
        </Form.Item>

        <Form.Item label="确认密码" name="confirmPassword" rules={[{ required: true, message: "请输入确认密码!" }]}>
          <Input.Password />
        </Form.Item>
        <Form.Item
          label="邮箱"
          name="email"
          rules={[
            { required: true, message: "请输入邮箱!" },
            { type: "email", message: "请输入合法邮箱地址!" },
          ]}
        >
          <Input disabled />
        </Form.Item>

        <Form.Item label="验证码" name="captcha" rules={[{ required: true, message: "请输入验证码!" }]}>
          <Space>
            <Input placeholder="请输入验证码" />
            <Button type="primary" onClick={sendCaptcha}>
              发送验证码
            </Button>
          </Space>
        </Form.Item>

        <Form.Item {...layout1} label=" ">
          <Button className="btn" type="primary" htmlType="submit">
            修改密码
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
