declare namespace Global {
  type ResultType<T = any> = {
    success?: boolean;
    data: T;
    message: string;
    code: number;
    total?: number;
    success: boolean;
  };
  type PageParams = {
    pageNo: number;
    pageSize: number;
  };
}
