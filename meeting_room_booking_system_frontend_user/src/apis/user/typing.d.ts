declare namespace user {
  interface UserSearchResult {
    id: number;
    username: string;
    nickName: string;
    email: string;
    headPic: string;
    createTime: Date;
    isFrozen: boolean;
  }

  interface UserSearchParams extends Global.PageParams {
    username: string; // 用户名称
    nickName: string; // 用户昵称
    email: string; // 邮箱
  }


  interface LoginUser {
    username: string;
    password: string;
  }

  interface UserInfo {
    username: string;
    headPic: string;
    nickName: string;
    email: string;
    captcha: string;
  }

  interface UpdatePassword {
    email: string;
    captcha: string;
    password: string;
    username: string;
    confirmPassword: string;
  }
}
