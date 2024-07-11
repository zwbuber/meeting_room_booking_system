import App from "../App";
import ErrorPage from "../pages/ErrorPage/ErrorPage";
import NotFoundPage from "../pages/ErrorPage/404";
import { Login } from "../pages/Login/Login";
import { UserManage } from "../pages/UserManage/UserManage";
import { ModifyMenu } from "../pages/ModifyMenu/ModifyMenu";
import { InfoModify } from "../pages/InfoModify/InfoModify";
import { PasswordModify } from "../pages/PasswordModify/PasswordModify";
import { MeetingRoomManage } from "../pages/MeetingRoomManage/MeetingRoomManage";
import { BookingManage } from "../pages/BookingManage/BookingManage";
import { Statistics } from "../pages/Statistics/Statistics";
import { Navigate } from "react-router-dom";

export const routers = [
  {
    path: "/",
    /** 重定向 */
    element: <Navigate replace to="/meeting_room_manage" />,
  },
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/meeting_room_manage",
        name: "会议室管理",
        element: <MeetingRoomManage />,
      },

      {
        path: "/booking_manage",
        name: "预定管理",
        element: <BookingManage />,
      },
      {
        path: "/statistics",
        name: "统计管理",
        element: <Statistics />,
      },
      // {
      //   path: "/user_manage",
      //   name: "用户管理",
      //   element: <UserManage />,
      // },
      {
        path: "/user",
        name: "用户管理",
        children: [
          {
            path: "/user/user_manage",
            name: "用户列表",
            element: <UserManage />,
          },
          {
            path: "/user/info_modify",
            name: "信息修改",
            element: <InfoModify />,
          },
          {
            path: "/user/password_modify",
            name: "密码修改",
            element: <PasswordModify />,
          },
        ],
      },
    ],
  },
  {
    path: "/login",
    name: "登录",
    element: <Login />,
  },
  { path: "*", element: <NotFoundPage /> },
];
