import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { notification } from "antd";
import { refreshToken } from "@/apis/user";
import { router } from "@/routes";
import { sleep } from "@/utils";

interface PendingTask {
  config: AxiosRequestConfig;
  resolve: (value: unknown) => void;
}

class Http {
  public baseUrl: string = import.meta.env.VITE_BASE_API;
  private axiosInstance: AxiosInstance;
  private refreshing: boolean = false;
  private readonly subscribers: PendingTask[] = [];
  public constructor() {
    // 实例化axios
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: 1000 * 60,
    });

    // 请求拦截器
    this.axiosInstance.interceptors.request.use(function (config) {
      const accessToken = localStorage.getItem("access_token");

      if (accessToken) {
        config.headers.authorization = "Bearer " + accessToken;
      }
      return config;
    });

    // 响应拦截器
    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        const { response } = error;

        const { data, config } = error.response;

        if (response.status === 401 && config.url.includes("/user/admin/refresh")) {
          await this.unAuthorizedHandler();
          return Promise.reject(error);
        }

        if (this.refreshing) {
          return new Promise((resolve) => {
            this.subscribers.push({ config, resolve });
          });
        }

        if (response.status === 401 && !config.url.includes("/user/admin/refresh")) {
          this.refreshing = true;
          const res = await refreshToken();
          this.refreshing = false;
          if (res.code === 200 || res.code === 201) {
            this.subscribers.forEach(({ config, resolve }) => {
              resolve(this.axiosInstance(config));
            });
            return this.axiosInstance(config);
          }
          await this.unAuthorizedHandler();
        }

        notification.error({
          message: "错误",
          description: data?.data || "未知错误",
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * @description 重新登录处理
   */
  private async unAuthorizedHandler() {
    // 重新登录
    await router.navigate("/login");
    this.refreshing = false; // 重置刷新状态
    this.subscribers.length = 0; // 清空请求队列
    await sleep(500); // 等待500ms
    notification.error({
      message: "异常",
      description: "登录已过期，请重新登录！",
    });
  }

  /**
   * @description: 请求方法
   */
  request(config: AxiosRequestConfig) {
    // 区分 get params 和 post data 的使用
    if (config.method?.toLowerCase() === "post" && config.params) {
      // 如果是 post 请求且有 params，将其转为 data
      config.data = config.params;
      delete config.params; // 删除 params 以避免混淆
    }

    return this.axiosInstance.request(config).then((res) => {
      if (res.status === 200 || res.status === 201) {
        return res.data; // 直接返回数据
      } else {
        throw res;
      }
    });
  }
}

export default new Http();
