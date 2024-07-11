import { useEffect, useRef, useState } from "react";
import { Button, message } from "antd";
import { ProForm, ProFormCaptcha, ProFormInstance, ProFormText, ProFormUploadButton } from "@ant-design/pro-components";
import "./info_modify.css";
import { getUserInfo, updateInfo, updateUserInfoCaptcha } from "@/apis/user";
import { uploadFile } from "@/apis";

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

export interface UserInfo {
  username: string;
  headPic: string;
  nickName: string;
  email: string;
  captcha: string;
}

export function InfoModify() {
  const formRef = useRef<ProFormInstance>();
  const [headPic, setHeadPic] = useState<string>("");

  const onFinish = async (values: UserInfo) => {
    const res = await updateInfo({ ...values, headPic });

    if (res.success) {
      const { message: msg, data } = res;
      if (msg === "success") {
        message.success("用户信息更新成功");
      } else {
        message.error(data);
      }
    } else {
      message.error(res.data || "系统繁忙，请稍后再试");
    }
  };

  const sendCaptcha = async function () {
    const res = await updateUserInfoCaptcha();
    if (res.success) {
      message.success(res.data);
    } else {
      message.error("系统繁忙，请稍后再试");
    }
  };

  useEffect(() => {
    async function query() {
      const res = await getUserInfo();

      if (res.success) {
        setHeadPic(res?.data?.headPic || "");
        // formRef.current?.setFieldValue("headPic", arr);
        formRef.current?.setFieldValue("nickName", res.data.nickName);
        formRef.current?.setFieldValue("email", res.data.email);
      }
    }

    query();
  }, []);

  return (
    <div id="updateInfo-container">
      <ProForm
        {...layout}
        formRef={formRef}
        onFinish={onFinish}
        autoComplete="off"
        submitter={{
          render: () => {
            return [
              <Button className="btn" type="primary" htmlType="submit" key="modify">
                修改
              </Button>,
            ];
          },
        }}
      >
        <ProFormUploadButton
          name="headPic"
          label="头像"
          max={1}
          fieldProps={{
            name: "file",
            listType: "picture-card",
            onRemove: () => {
              setHeadPic("");
            },
            customRequest: async (option: any) => {
              const formData = new FormData();
              formData.append("file", option.file);
              try {
                const { success, data } = await uploadFile(formData);
                console.log(data);
                if (success) {
                  setHeadPic(data);
                  return success;
                } else {
                  message.error("上传失败，请刷新重试");
                  return false;
                }
              } catch (error) {
                message.error("上传失败，请刷新重试");
                return false;
              }
            },
          }}
          fileList={
            (headPic !== "" && [
              {
                uid: "-1",
                name: "image.png",
                status: "done",
                url: "http://localhost:3005/" + headPic,
              },
            ]) ||
            []
          }
        />

        <ProFormText name="nickName" label="昵称" placeholder="请输入昵称" rules={[{ required: true, message: "请输入昵称!" }]} />

        <ProFormText
          name="email"
          label="邮箱"
          placeholder="请输入邮箱"
          rules={[
            { required: true, message: "请输入邮箱!" },
            { type: "email", message: "请输入合法邮箱地址!" },
          ]}
          disabled
        />
        <ProFormCaptcha
          // 手机号的 name，onGetCaptcha 会注入这个值
          phoneName="验证码"
          name="captcha"
          rules={[
            {
              required: true,
              message: "请输入验证码",
            },
          ]}
          placeholder="请输入验证码"
          // 如果需要失败可以 throw 一个错误出来，onGetCaptcha 会自动停止
          // throw new Error("获取验证码错误")
          onGetCaptcha={async (phone) => {
            console.log(phone);
            sendCaptcha();
            // await sleep(1000);
            // message.success(`邮箱验证码 ${phone} 验证码发送成功!`);
          }}
        />
      </ProForm>
    </div>
  );
}
