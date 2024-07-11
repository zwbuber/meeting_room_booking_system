import { RegisterUser } from "@/page/register/Register";
import { UserInfo } from "@/page/update_info/UpdateInfo";
import { UpdatePassword } from "@/page/update_password/UpdatePassword";
import http from "@/server";

export async function login(username: string, password: string) {
  return await http.request({
    method: "post",
    url: "/user/login",
    params: {
      username,
      password,
    },
  });
}

// 刷新token
export async function refreshToken() {
  const res = await http.request({
    method: "get",
    url: "/user/admin/refresh",
    params: {
      refresh_token: localStorage.getItem("refresh_token"),
    },
  });
  localStorage.setItem("access_token", res.data.access_token);
  localStorage.setItem("refresh_token", res.data.refresh_token);
  return res;
}


export async function registerCaptcha(email: string) {
  return await http.request({
    method: "get",
    url: "/user/register-captcha",
    params: {
      address: email,
    },
  });
}

export async function register(registerUser: RegisterUser) {
  return await http.request({
    method: "post",
    url: "/user/register",
    params: registerUser,
  });
}

export async function updatePasswordCaptcha(email: string) {
  return await http.request({
    method: "get",
    url: "/user/update_password/captcha",
    params: {
      address: email,
    },
  });
}

export async function updatePassword(data: UpdatePassword) {
  return await http.request({
    method: "post",
    url: "/user/update_password",
    params: data,
  });
}

export async function getUserInfo() {
  return await http.request({
    method: "get",
    url: "/user/info"
  });
}

export async function updateInfo(data: UserInfo) {
  return await http.request({
    method: "post",
    url: "/user/update",
    params: data,
  });
}

export async function updateUserInfoCaptcha() {
  return await http.request({
    method: "get",
    url: "/user/update/captcha"
  });
}


