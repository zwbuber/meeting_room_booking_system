import { useRef } from "react";
import { Button, Popconfirm, message } from "antd";
import { ActionType, ProColumns, ProTable } from "@ant-design/pro-components";
import dayjs from "dayjs";
import { bookingList, apply, reject, unbind } from "@/apis/bookingManage";

export function BookingManage() {
  const actionRef = useRef<ActionType>();

  async function changeStatus(id: number, status: "apply" | "reject" | "unbind") {
    const methods = {
      apply,
      reject,
      unbind,
    };
    const res = await methods[status](id);
    if (res.success) {
      message.success("状态更新成功");
      actionRef.current?.reload();
    } else {
      message.error(res.data);
    }
  }

  const columns: ProColumns<booking.BookingSearchResult>[] = [
    {
      title: "会议室名称",
      dataIndex: "room",
      render(_, record) {
        return record.room.name;
      },
    },
    {
      title: "预定人",
      dataIndex: "user",
      render(_, record) {
        return record.user?.username;
      },
    },
    {
      title: "开始时间",
      dataIndex: "startTime",
      render(_, record) {
        return dayjs(new Date(record.startTime)).format("YYYY-MM-DD HH:mm:ss");
      },
    },
    {
      title: "结束时间",
      dataIndex: "endTime",
      render(_, record) {
        return dayjs(new Date(record.endTime)).format("YYYY-MM-DD HH:mm:ss");
      },
    },
    {
      title: "审批状态",
      dataIndex: "status",
      hideInSearch: true,
      onFilter: (value, record) => record.status.startsWith(value as string),
      filters: [
        {
          text: "审批通过",
          value: "审批通过",
        },
        {
          text: "审批驳回",
          value: "审批驳回",
        },
        {
          text: "申请中",
          value: "申请中",
        },
        {
          text: "已解除",
          value: "已解除",
        },
      ],
    },
    {
      title: "预定时间",
      dataIndex: "createTime",
      render(_, record) {
        return dayjs(new Date(record.createTime)).format("YYYY-MM-DD hh:mm:ss");
      },
    },
    {
      title: "备注",
      dataIndex: "note",
      hideInSearch: true,
    },
    {
      title: "描述",
      dataIndex: "description",
      hideInSearch: true,
    },
    {
      title: "操作",
      key: "option",
      valueType: "option",
      fixed: "right",
      render: (_, record) => [
        <Popconfirm
          title="通过申请"
          description="确认通过吗？"
          onConfirm={() => changeStatus(record.id, "apply")}
          okText="Yes"
          cancelText="No"
          key="apply"
        >
          <Button type="primary" ghost size="small">
            通过
          </Button>
        </Popconfirm>,
        <Popconfirm
          title="驳回申请"
          description="确认驳回吗？"
          onConfirm={() => changeStatus(record.id, "reject")}
          okText="Yes"
          cancelText="No"
          key="reject"
        >
          <Button type="primary" ghost size="small">
            驳回
          </Button>
        </Popconfirm>,
        <Popconfirm
          title="解除申请"
          description="确认解除吗？"
          onConfirm={() => changeStatus(record.id, "unbind")}
          okText="Yes"
          cancelText="No"
          key="unbind"
        >
          <Button danger size="small">
            解除
          </Button>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <div>
      <ProTable
        actionRef={actionRef}
        columns={columns}
        scroll={{ x: 1300 }}
        rowKey={"id"}
        request={async (params) => {
          const { current: pageNo, pageSize, ...otherParams } = params;
          const res = await bookingList({ pageNo, pageSize, ...otherParams } as booking.SearchBookingParams);
          return {
            total: res.data?.totalCount ?? 0,
            data: res.data?.bookings ?? [],
            success: res.success,
          };
        }}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        rowSelection={false}
      />
    </div>
  );
}
