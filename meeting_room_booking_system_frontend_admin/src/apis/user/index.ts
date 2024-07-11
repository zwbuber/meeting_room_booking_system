import http from "@/server";

export async function login(username: string, password: string) {
  return await http.request({
    method: "post",
    url: "/user/admin/login",
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

export async function userSearch(params?: user.UserSearchParams) {
  return await http.request({
    method: "get",
    url: "/user/list",
    params,
  });
}

export async function freeze(id: number) {
  return await http.request({
    method: "get",
    url: "/user/freeze",
    params: {
      id,
    },
  });
}

export async function getUserInfo() {
  return await http.request({
    method: "get",
    url: "/user/info",
  });
}

export async function updateInfo(data: user.UserInfo) {
  return await http.request({
    method: "post",
    url: "/user/admin/update",
    data,
  });
}

export async function updateUserInfoCaptcha() {
  return await http.request({
    method: "get",
    url: "/user/update/captcha",
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

export async function updatePassword(data: user.UpdatePassword) {
  return await http.request({
    method: "post",
    url: "/user/admin/update_password",
    data,
  });
}
