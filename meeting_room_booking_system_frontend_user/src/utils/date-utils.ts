import dayjs from "dayjs";
import zhCN from "dayjs/locale/zh-cn";
import relativeTime from "dayjs/plugin/relativeTime";

export function init(): void {
  dayjs.locale(zhCN);
  dayjs.extend(relativeTime);
}

/**
 * 格式化日期字符串
 *
 * @param date 日期，可以是字符串、数字或Date对象
 * @param format 日期格式，默认为 "YYYY-MM-DD HH:mm:ss"
 * @returns 格式化后的日期字符串，如果传入的日期为空则返回 "-"
 */
export function format(date: string | number | Date, format = "YYYY-MM-DD HH:mm:ss"): string {
  return dayjs(date)?.format(format) ?? "-";
}
