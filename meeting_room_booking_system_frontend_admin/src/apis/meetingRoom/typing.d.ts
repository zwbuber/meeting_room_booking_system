declare namespace meetingRoom {
  interface MeetingRoomSearchResult {
    id: number;
    name: string; // 会议室名称
    capacity: number; // 会议室容纳人数
    location: string; //  会议室位置
    equipment: string; //  会议室设备
    description: string; //  会议室描述
    isBooked: boolean; // 会议室是否被预定
    createTime: Date; // 会议室创建时间
    updateTime: Date; // 会议室更新时间
  }

  type  MeetingRoomSearchParams = {
    name: string; // 会议室名称
    capacity: number; // 会议室容纳人数
    equipment: string; //  会议室设备
  } & Global.PageParams;


  interface CreateMeetingRoom {
    name: string;
    capacity: number;
    location: string;
    equipment: string;
    description: string;
  }

  interface UpdateMeetingRoom {
    id: number;
    name: string;
    capacity: number;
    location: string;
    equipment: string;
    description: string;
  }
}
