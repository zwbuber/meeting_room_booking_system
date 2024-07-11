import App from "@/App";
import { ErrorPage } from "@/ErrorPage";
import { BookingHistory } from "@/page/booking_history/BookingHistory";
import { Login } from "@/page/login/Login";
import { MeetingRoomList } from "@/page/meeting_room_list/MeetingRoomList";
import { Register } from "@/page/register/Register";
import { UpdateInfo } from "@/page/update_info/UpdateInfo";
import { UpdatePassword } from "@/page/update_password/UpdatePassword";
import { Navigate } from "react-router-dom";

export const routers = [
  {
    path: "/",
    /** 重定向 */
    element: <Navigate replace to="/meeting_room_list" />,
  },
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/meeting_room_list",
        name: "会议室列表",
        element: <MeetingRoomList />,
      },
      {
        path: "/booking_history",
        name: "预定历史",
        element: <BookingHistory />,
      }
    ],
  },
  {
    path: "/update_info",
    name: "用户信息",
    element: <UpdateInfo />,
  },
  {
    path: "login",
    name: "登录",
    element: <Login />,
  },
  {
    path: "register",
    name: "注册",
    element: <Register />,
  },
  {
    path: "update_password",
    name: "更新密码",
    element: <UpdatePassword />,
  },
];
