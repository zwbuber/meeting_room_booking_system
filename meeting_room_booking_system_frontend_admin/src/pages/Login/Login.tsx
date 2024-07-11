import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { LoginFormPage, ProFormText } from "@ant-design/pro-components";
import { login } from "@/apis/user";
import { sleep } from "@/utils";

export function Login() {
  const navigate = useNavigate();

  const onFinish = async (values: user.LoginUser) => {
    const res = await login(values.username, values.password);

    if (res.success) {
      message.success("登录成功");
      localStorage.setItem("access_token", res.data.accessToken);
      localStorage.setItem("refresh_token", res.data.refreshToken);
      localStorage.setItem("user_info", JSON.stringify(res.data.userInfo));
      await sleep(1000);
      navigate("/");
    } else {
      message.error(res.data || "系统繁忙，请稍后再试");
    }
  };

  return (
    <div style={{ backgroundColor: "white", height: "100vh" }}>
      <LoginFormPage
        backgroundImageUrl="https://gw.alipayobjects.com/zos/rmsportal/FfdJeJRQWjEeGTpqgBKj.png"
        title="会议室预订系统"
        subTitle=""
        onFinish={onFinish}
      >
        <div style={{ marginTop: "36px" }}>
          <ProFormText
            name="username"
            fieldProps={{
              size: "large",
              prefix: <UserOutlined className={"prefixIcon"} />,
            }}
            placeholder={"请输入用户名"}
            rules={[
              {
                required: true,
                message: "请输入用户名!",
              },
            ]}
          />
          <ProFormText.Password
            name="password"
            fieldProps={{
              size: "large",
              prefix: <LockOutlined className={"prefixIcon"} />,
            }}
            placeholder={"请输入密码"}
            rules={[
              {
                required: true,
                message: "请输入密码！",
              },
            ]}
          />
        </div>
      </LoginFormPage>
    </div>
  );
}
