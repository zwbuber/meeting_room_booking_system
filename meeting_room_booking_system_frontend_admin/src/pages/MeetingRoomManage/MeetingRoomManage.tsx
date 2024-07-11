import { useRef, useState } from "react";
import { Button, Popconfirm, Tag, message } from "antd";
import { ActionType, ProColumns, ProTable } from "@ant-design/pro-components";
import { meetingRoomList, deleteMeetingRoom } from "@/apis/meetingRoom";
import { MeetingRoomModal } from "./MeetingRoomModal";
import { format } from "@/utils/date-utils";

export function MeetingRoomManage() {
  const actionRef = useRef<ActionType>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateId, setUpdateId] = useState<number>();

  const columns: ProColumns<meetingRoom.MeetingRoomSearchResult>[] = [
    {
      title: "ID",
      dataIndex: "id",
      valueType: "indexBorder",
      hideInSearch: true,
    },
    {
      title: "名称",
      dataIndex: "name",
      copyable: true,
    },
    {
      title: "容纳人数",
      dataIndex: "capacity",
    },
    {
      title: "位置",
      dataIndex: "location",
    },
    {
      title: "设备",
      dataIndex: "equipment",
      hideInSearch: true,
    },
    {
      title: "描述",
      dataIndex: "description",
      hideInSearch: true,
    },
    {
      title: "添加时间",
      dataIndex: "createTime",
      hideInSearch: true,
      render(_, record) {
        return format(record.createTime);
      },
    },
    {
      title: "上次更新时间",
      dataIndex: "updateTime",
      hideInSearch: true,
      render(_, record) {
        return format(record.updateTime);
      },
    },
    {
      title: "预定状态",
      dataIndex: "isBooked",
      render: (_, record) => (record.isBooked ? <Tag color="success">已被预订</Tag> : <Tag color="success">可预定</Tag>),
      hideInSearch: true,
    },
    {
      title: "操作",
      key: "option",
      valueType: "option",
      fixed: "right",
      render: (_, record) => [
        <Button
          key="edit"
          type="primary"
          size="small"
          onClick={() => {
            showModal(record);
          }}
        >
          更新
        </Button>,
        <Popconfirm
          key="delete"
          title="会议室删除"
          description="确认删除吗？"
          onConfirm={() => handleDelete(record.id)}
          okType="danger"
          okText="确定"
          cancelText="取消"
        >
          <Button danger size="small">
            删除
          </Button>
        </Popconfirm>,
      ],
    },
  ];

  // 删除会议室
  const handleDelete = async (id: number) => {
    try {
      await deleteMeetingRoom(id);
      message.success("删除成功");
      actionRef.current?.reload();
    } catch (e) {
      console.log(e);
      message.error("删除失败");
    }
  };

  const showModal = (record?: meetingRoom.MeetingRoomSearchResult) => {
    setUpdateId(record?.id);
    setIsModalOpen(true);
  };

  return (
    <div>
      <ProTable
        actionRef={actionRef}
        columns={columns}
        rowKey={"id"}
        scroll={{ x: 1300 }}
        request={async (params) => {
          const { current: pageNo, pageSize, ...otherParams } = params;
          const res = await meetingRoomList({ pageNo, pageSize, ...otherParams } as meetingRoom.MeetingRoomSearchParams);
          return {
            total: res.data?.totalCount ?? 0,
            data: res.data?.meetingRooms ?? [],
            success: res.success,
          };
        }}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        dateFormatter="string"
        rowSelection={false}
        toolBarRender={() => [
          <Button type="primary" onClick={() => showModal()}>
            添加会议室
          </Button>,
        ]}
      />
      <MeetingRoomModal
        isOpen={isModalOpen}
        id={updateId}
        handleClose={() => {
          setIsModalOpen(false);
          actionRef.current?.reload();
        }}
      ></MeetingRoomModal>
    </div>
  );
}
