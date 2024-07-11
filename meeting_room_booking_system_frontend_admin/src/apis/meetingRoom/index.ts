import http from "../../server";

export async function meetingRoomList(params: meetingRoom.MeetingRoomSearchParams) {
  return await http.request({
    method: 'get',
    url: "/meeting-room/list", 
    params
  });
}

export async function createMeetingRoom(data: meetingRoom.CreateMeetingRoom) {
  return await http.request({
    method: 'post',
    url: "/meeting-room/create", 
    data
  });
}

export async function updateMeetingRoom(data: meetingRoom.UpdateMeetingRoom) {
  return await http.request({
    method: 'put',
    url: "/meeting-room/update", 
    data
  });
}

export async function findMeetingRoom(id: number) {
  return await http.request({
    method: 'get',
    url: "/meeting-room/" + id
  });
}

export async function deleteMeetingRoom(id: number) {
  return await http.request({
    method: 'delete',
    url: "/meeting-room/" + id
  });
}
