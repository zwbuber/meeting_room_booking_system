import type React from "react";
import { Link } from "react-router-dom";
import { Button, Result } from "antd";
import { ResultStatusType } from "antd/es/result";

type NotFoundPropsType = {
  status?: ResultStatusType;
  title?: string;
  subTitle?: string;
  extra?: React.ReactNode;
};
const NotFound: React.FC<NotFoundPropsType> = ({
  status = "404",
  title = "404",
  subTitle = "对不起！您访问的页面不存在",
  extra = (
    <Button type="primary">
      <Link to="/">返回首页</Link>
    </Button>
  ),
}) => {
  return (
    <>
      <Result status={status} title={title} subTitle={subTitle} extra={extra} />
    </>
  );
};

export default NotFound;
