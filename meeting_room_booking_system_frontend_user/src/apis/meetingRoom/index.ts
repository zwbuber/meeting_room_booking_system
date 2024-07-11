import http from "../../server";


export async function searchMeetingRoomList(name: string, capacity: number, equipment: string, pageNo: number, pageSize: number) {
  return await http.request({
    method: "get",
    url: "/meeting-room/list",
    params: {
      name,
      capacity,
      equipment,
      pageNo,
      pageSize,
    },
  });
}
