import http from "@/server";
import dayjs from "dayjs";

export async function bookingList(params: booking.SearchBookingParams) {
  const { pageNo, pageSize, ...searchBooking } = params;
  let bookingTimeRangeStart;
  let bookingTimeRangeEnd;

  if (searchBooking.rangeStartDate && searchBooking.rangeStartTime) {
    const rangeStartDateStr = dayjs(searchBooking.rangeStartDate).format("YYYY-MM-DD");
    const rangeStartTimeStr = dayjs(searchBooking.rangeStartTime).format("HH:mm");
    bookingTimeRangeStart = dayjs(rangeStartDateStr + " " + rangeStartTimeStr).valueOf();
  }

  if (searchBooking.rangeEndDate && searchBooking.rangeEndTime) {
    const rangeEndDateStr = dayjs(searchBooking.rangeEndDate).format("YYYY-MM-DD");
    const rangeEndTimeStr = dayjs(searchBooking.rangeEndTime).format("HH:mm");
    bookingTimeRangeEnd = dayjs(rangeEndDateStr + " " + rangeEndTimeStr).valueOf();
  }
  return await http.request({
    method: "get",
    url: "/booking/list",
    params: {
      username: searchBooking.username,
      meetingRoomName: searchBooking.meetingRoomName,
      meetingRoomPosition: searchBooking.meetingRoomPosition,
      bookingTimeRangeStart,
      bookingTimeRangeEnd,
      pageNo: pageNo,
      pageSize: pageSize,
    },
  });
}

export async function apply(id: number) {
  return await http.request({
    method: "get",
    url: "/booking/apply/" + id,
  });
}
export async function reject(id: number) {
  return await http.request({
    method: "get",
    url: "/booking/reject/" + id,
  });
}

export async function unbind(id: number) {
  return await http.request({
    method: "get",
    url: "/booking/unbind/" + id,
  });
}
