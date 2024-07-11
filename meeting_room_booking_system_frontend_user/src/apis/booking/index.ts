import { SearchBooking } from "@/page/booking_history/BookingHistory";
import { CreateBooking } from "@/page/meeting_room_list/CreateBookingModal";
import http from "@/server";
import dayjs from "dayjs";

export async function bookingList(searchBooking: SearchBooking, pageNo: number, pageSize: number) {
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

export async function unbind(id: number) {
  return await http.request({
    method: "get",
    url: "/booking/unbind/" + id,
  });
}

export async function bookingAdd(booking: CreateBooking) {
  const rangeStartDateStr = dayjs(booking.rangeStartDate).format("YYYY-MM-DD");
  const rangeStartTimeStr = dayjs(booking.rangeStartTime).format("HH:mm");
  const startTime = dayjs(rangeStartDateStr + " " + rangeStartTimeStr).valueOf();

  const rangeEndDateStr = dayjs(booking.rangeEndDate).format("YYYY-MM-DD");
  const rangeEndTimeStr = dayjs(booking.rangeEndTime).format("HH:mm");
  const endTime = dayjs(rangeEndDateStr + " " + rangeEndTimeStr).valueOf();

  return await http.request({
    method: "post",
    url: "/booking/add",
    params: {
      meetingRoomId: booking.meetingRoomId,
      startTime,
      endTime,
      note: booking.note,
    },
  });
}
