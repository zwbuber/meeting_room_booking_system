import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Dropdown, MenuProps, message } from "antd";
import { PageContainer, ProLayout } from "@ant-design/pro-components";
import { router } from "@/routes";
import { sleep } from "@/utils";

const userInfo = JSON.parse(localStorage.getItem("user_info") || "{}");

export const BasicLayout = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const items: MenuProps["items"] = [
    {
      key: "out",
      label: (
        <div
          onClick={() => {
            navigate("/user/password_modify", { replace: true });
          }}
        >
          修改密码
        </div>
      ),
    },
    {
      key: "out",
      label: (
        <div
          onClick={async () => {
            message.success("退出成功");
            localStorage.setItem("access_token", "");
            localStorage.setItem("refresh_token", "");
            localStorage.setItem("user_info", "");
            await sleep(1000);
            navigate("/login");
          }}
        >
          退出登录
        </div>
      ),
    },
  ];
  return (
    <div>
      <ProLayout
        logo={null}
        title="会议室预订系统管理端"
        route={router.routes?.[1]}
        location={{
          pathname,
        }}
        avatarProps={{
          size: "small",
          src: userInfo.headPic,
          title: userInfo.nickName,
          render: (_, defaultDom) => {
            return <Dropdown menu={{ items }}>{defaultDom}</Dropdown>;
          },
        }}
        menuProps={{
          onClick: ({ key }) => {
            navigate(key || "/");
          },
        }}
        fixSiderbar={true}
        layout={"mix"}
      >
        <PageContainer>
          <Outlet />
        </PageContainer>
      </ProLayout>
    </div>
  );
};
