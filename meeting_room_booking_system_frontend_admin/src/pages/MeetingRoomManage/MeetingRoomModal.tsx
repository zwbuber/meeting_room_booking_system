import { useEffect, useRef } from "react";
import { Modal, message } from "antd";
import { ProForm, ProFormInstance, ProFormText, ProFormTextArea } from "@ant-design/pro-components";
import { createMeetingRoom, findMeetingRoom, updateMeetingRoom } from "@/apis/meetingRoom";

interface CreateMeetingRoomModalProps {
  id?: number;
  isOpen: boolean;
  handleClose: () => void;
}

export function MeetingRoomModal(props: CreateMeetingRoomModalProps) {
  const modalFormRef = useRef<ProFormInstance>();

  const handleOk = async function () {
    const val = await modalFormRef.current?.validateFields();

    val.description = val.description || "";
    val.equipment = val.equipment || "";

    const resVal = {
      ...val,
    };
    const meetingRoomId = modalFormRef.current?.getFieldValue("id") || "";
    if (meetingRoomId) {
      // 更新
      const res = await updateMeetingRoom({
        ...resVal,
        id: meetingRoomId,
      });
      if (res.success) {
        message.success("更新成功");
        props.handleClose();
      } else {
        message.error(res.data);
      }
      return;
    }
    // 新建
    const res = await createMeetingRoom({ ...resVal });
    if (res.success) {
      message.success("创建成功");
      modalFormRef.current?.resetFields();
      props.handleClose();
    } else {
      message.error(res.data);
    }
  };

  useEffect(() => {
    async function query() {
      if (!props.id) {
        return;
      }
      const res = await findMeetingRoom(props.id);
      const { data } = res;
      if (res.success) {
        modalFormRef.current?.setFieldValue("id", data.id);
        modalFormRef.current?.setFieldValue("name", data.name);
        modalFormRef.current?.setFieldValue("location", data.location);
        modalFormRef.current?.setFieldValue("capacity", data.capacity);
        modalFormRef.current?.setFieldValue("equipment", data.equipment);
        modalFormRef.current?.setFieldValue("description", data.description);
      } else {
        message.error(res.data);
      }
    }
    query();
  }, [props.id]);

  return (
    <Modal
      title={props.id ? "更新会议室" : "创建会议室"}
      open={props.isOpen}
      onOk={handleOk}
      onCancel={() => props.handleClose()}
      okText={props.id ? "更新" : "创建"}
    >
      <ProForm labelCol={{ span: 6 }} submitter={false} layout="horizontal" formRef={modalFormRef}>
        <ProFormText label="会议室名称" name="name" rules={[{ required: true, message: "请输入会议室名称!" }]} />
        <ProFormText label="位置" name="location" rules={[{ required: true, message: "请输入会议室位置!" }]} />
        <ProFormText label="容纳人数" name="capacity" rules={[{ required: true, message: "请输入会议室容量!" }]} />
        <ProFormText label="设备" name="equipment" rules={[{ required: true }]} />
        <ProFormTextArea label="描述" name="description" rules={[{ required: true }]} />
      </ProForm>
    </Modal>
  );
}
