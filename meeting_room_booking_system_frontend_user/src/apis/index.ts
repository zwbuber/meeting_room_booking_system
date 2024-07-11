import http from "@/server";


export async function uploadFile(data?: any) {
  return http.request({
    url: "/user/upload",
    method: "post",
    data,
    headers: { "Content-Type": "multipart/form-data" },
  });
}
