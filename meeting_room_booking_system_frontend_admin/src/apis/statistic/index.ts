import http from "@/server";


export async function meetingRoomUsedCount(startTime: string, endTime: string) {
  return await http.request({
    method: "get",
    url: "/statistic/meetingRoomUsedCount",
    params: {
      startTime,
      endTime,
    },
  });
  // return await axiosInstance.get("/statistic/meetingRoomUsedCount", {
  //   params: {
  //     startTime,
  //     endTime,
  //   },
  // });
}

export async function userBookingCount(startTime: string, endTime: string) {
  return await http.request({
    method: "get",
    url: "/statistic/userBookingCount",
    params: {
      startTime,
      endTime,
    },
  });
  // return await axiosInstance.get("/statistic/userBookingCount", {
  //   params: {
  //     startTime,
  //     endTime,
  //   },
  // });
}
