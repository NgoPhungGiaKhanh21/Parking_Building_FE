import { Button, Form, Input, InputNumber, Modal, TimePicker } from "antd";

const UpdateBuildingModal = ({ open, onCancel, form, loading, onSubmit }) => {
  return (
    <Modal title="Update Building" open={open} onCancel={onCancel} footer={null} width={720}>
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={onSubmit}
        className="pt-2"
      >
        <Form.Item
          name="buildingName"
          label="Building Name"
          rules={[
            { required: true, message: "Please enter building name." },
            { max: 120, message: "Building name must be under 120 characters." },
          ]}
        >
          <Input size="large" placeholder="Enter building name" />
        </Form.Item>

        <Form.Item
          name="address"
          label="Address"
          rules={[
            { required: true, message: "Please enter building address." },
            { max: 255, message: "Address must be under 255 characters." },
          ]}
        >
          <Input size="large" placeholder="Enter building address" />
        </Form.Item>

        <Form.Item
          name="totalFloors"
          label="Total Floors"
          rules={[
            { required: true, message: "Please enter total floors." },
            { type: "number", min: 1, message: "Total floors must be at least 1." },
          ]}
        >
          <InputNumber
            size="large"
            min={1}
            precision={0}
            className="w-full!"
            placeholder="Enter total floors"
          />
        </Form.Item>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Form.Item
            name="operatingStartTime"
            label="Operating Start Time"
            rules={[{ required: true, message: "Please select operating start time." }]}
          >
            <TimePicker format="HH:mm:ss" className="w-full" placeholder="Start time" />
          </Form.Item>
          <Form.Item
            name="operatingEndTime"
            label="Operating End Time"
            rules={[{ required: true, message: "Please select operating end time." }]}
          >
            <TimePicker format="HH:mm:ss" className="w-full" placeholder="End time" />
          </Form.Item>
        </div>

        <Form.Item
          label="Contact Number"
          name="contactNumber"
          rules={[{ required: true, message: "Please fill Contact Number." }]}
        >
          <Input size="large" placeholder="Enter Contact Number" />
        </Form.Item>

        <Form.Item className="mb-0 pt-2">
          <Button
            htmlType="submit"
            type="primary"
            size="large"
            loading={loading}
            className="h-11 w-full rounded-lg px-7 font-semibold"
          >
            Update Building
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdateBuildingModal;
