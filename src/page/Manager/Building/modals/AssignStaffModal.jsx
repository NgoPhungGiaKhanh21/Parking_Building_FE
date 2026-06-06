import { Building2, UserPlus } from "lucide-react";
import { Button, Form, Modal, Select } from "antd";

const AssignStaffModal = ({
  open,
  onCancel,
  form,
  loading,
  buildings = [],
  staffs = [],
  onSubmit,
}) => {
  const buildingOptions = buildings.map((building) => ({
    value: building.id,
    label: building.name || `Building #${building.id}`,
  }));

  const staffOptions = staffs.map((staff) => ({
    value: staff.userId || staff.staffId || staff.id,
    label: staff.fullName
      ? `${staff.fullName}${staff.email ? ` (${staff.email})` : ""}`
      : staff.email || `Staff #${staff.userId || staff.id}`,
  }));

  return (
    <Modal
      title="Assign Staff to Building"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={560}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={onSubmit}
        className="pt-2"
      >
        <Form.Item
          name="buildingId"
          label="Building"
          rules={[{ required: true, message: "Please select a building." }]}
        >
          <Select
            size="large"
            placeholder="Select building"
            options={buildingOptions}
            showSearch
            optionFilterProp="label"
            suffixIcon={<Building2 size={16} className="text-slate-400" />}
          />
        </Form.Item>

        <Form.Item
          name="userId"
          label="Staff"
          rules={[{ required: true, message: "Please select a staff member." }]}
        >
          <Select
            size="large"
            placeholder="Select staff"
            options={staffOptions}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>

        <div className="mt-6 flex justify-end gap-3">
          <Button onClick={onCancel}>Cancel</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<UserPlus size={16} />}
          >
            Assign Staff
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AssignStaffModal;
