import { Building2, MapPin, Layers, FileText } from "lucide-react";
import { Button, Form, Input, InputNumber, Modal, TimePicker } from "antd";

const CreateBuildingModal = ({ open, onCancel, form, loading, onSubmit }) => {
  return (
    <Modal title="Create Building" open={open} onCancel={onCancel} footer={null} width={720}>
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
          <Input
            size="large"
            placeholder="Enter building name"
            prefix={<Building2 size={16} className="text-slate-400" />}
          />
        </Form.Item>

        <Form.Item
          name="address"
          label="Address"
          rules={[
            { required: true, message: "Please enter building address." },
            { max: 255, message: "Address must be under 255 characters." },
          ]}
        >
          <Input
            size="large"
            placeholder="Enter building address"
            prefix={<MapPin size={16} className="text-slate-400" />}
          />
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
            addonBefore={<Layers size={16} className="text-slate-400" />}
          />
        </Form.Item>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Form.Item
            name="operatingStartTime"
            label="Operating Start Time"
            rules={[{ required: true, message: "Please select operating start time." }]}
          >
            <TimePicker format="HH:mm:ss" className="w-full" placeholder="Select start time" />
          </Form.Item>
          <Form.Item
            name="operatingEndTime"
            label="Operating End Time"
            rules={[{ required: true, message: "Please select operating end time." }]}
          >
            <TimePicker format="HH:mm:ss" className="w-full" placeholder="Select end time" />
          </Form.Item>
        </div>

        <Form.Item
          label="Contact Number"
          name="contactNumber"
          rules={[{ required: true, message: "Please fill Contact Number." }]}
        >
          <Input
            size="large"
            placeholder="Enter Contact Number"
            prefix={<MapPin size={16} className="text-slate-400" />}
          />
        </Form.Item>

        <Form.Item className="mb-0 pt-2">
          <Button
            htmlType="submit"
            type="primary"
            size="large"
            loading={loading}
            className="h-11 w-full rounded-lg px-7 font-semibold"
            icon={<FileText size={16} />}
          >
            Create Building
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateBuildingModal;
