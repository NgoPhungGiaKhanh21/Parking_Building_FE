import { Button, Form, Input, InputNumber, Modal } from "antd";

const UpdateFloorModal = ({ open, onCancel, form, loading, onSubmit }) => {
  return (
    <Modal title="Update Floor" open={open} onCancel={onCancel} footer={null} width={560}>
      <Form form={form} layout="vertical" requiredMark={false} onFinish={onSubmit}>
        <Form.Item
          name="floorName"
          label="Floor Name"
          rules={[{ required: true, message: "Please enter floor name." }]}
        >
          <Input placeholder="Enter floor name" />
        </Form.Item>

        <Form.Item
          name="maxCapacity"
          label="Max Capacity"
          rules={[{ required: true, message: "Please enter max capacity." }]}
        >
          <InputNumber min={1} precision={0} className="w-full!" />
        </Form.Item>

        <Button htmlType="submit" type="primary" loading={loading} className="w-full">
          Update Floor
        </Button>
      </Form>
    </Modal>
  );
};

export default UpdateFloorModal;
