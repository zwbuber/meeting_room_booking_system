import { useRef } from "react";
import { Button, Image, Tag, message } from "antd";
import { ActionType, ProColumns, ProTable } from "@ant-design/pro-components";
import { userSearch, freeze } from "@/apis/user";

export function UserManage() {
  const actionRef = useRef<ActionType>();

  const columns: ProColumns<user.UserSearchResult>[] = [
    {
      title: "用户名",
      dataIndex: "username",
    },
    {
      title: "头像",
      dataIndex: "headPic",
      render: (value) => {
        return value ? <Image width={50} src={`http://localhost:3005/${value}`} /> : "";
      },
      hideInSearch: true,
    },
    {
      title: "昵称",
      dataIndex: "nickName",
    },
    {
      title: "邮箱",
      dataIndex: "email",
      hideInSearch: true,
    },
    {
      title: "注册时间",
      dataIndex: "createTime",
      hideInSearch: true,
    },
    {
      title: "状态",
      dataIndex: "isFrozen",
      render: (_, record) => (record.isFrozen ? <Tag color="error">已冻结</Tag> : <Tag color="success">未冻结</Tag>),
      hideInSearch: true,
    },
    {
      title: "操作",
      key: "option",
      valueType: "option",
      render: (_, record) => [
        <Button
          key="freeze"
          type="link"
          onClick={() => {
            freezeUser(record.id);
          }}
        >
          {record.isFrozen ? "解冻" : "冻结"}
        </Button>,
      ],
    },
  ];

  const freezeUser = async (id: number) => {
    const res = await freeze(id);
    if (res.success) {
      message.success("操作成功");
      actionRef.current?.reload();
    } else {
      message.error(res.data || "系统繁忙，请稍后再试");
    }
  };

  return (
    <div>
      <ProTable
        actionRef={actionRef}
        columns={columns}
        rowKey={"id"}
        request={async (params) => {
          const { current: pageNo, pageSize, ...otherParams } = params;
          const res = await userSearch({ pageNo, pageSize, ...otherParams } as user.UserSearchParams);
          return {
            total: res?.data?.totalCount ?? 0,
            data: res?.data?.users ?? [],
            success: res?.success ?? false,
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
