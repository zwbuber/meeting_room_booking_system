declare namespace booking {
  interface BookingSearchResult {
    id: number;
    startTime: string;
    endTime: string;
    status: string;
    note: string;
    createTime: string;
    updateTime: string;
    user: UserSearchResult;
    room: MeetingRoomSearchResult;
  }

  interface SearchBookingParams extends Global.PageParams {
    username: string;
    meetingRoomName: string;
    meetingRoomPosition: string;
    rangeStartDate: Date;
    rangeStartTime: Date;
    rangeEndDate: Date;
    rangeEndTime: Date;
  }
}
