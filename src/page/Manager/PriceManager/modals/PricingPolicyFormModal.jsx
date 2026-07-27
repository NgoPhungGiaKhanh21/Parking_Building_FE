import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Switch,
} from "antd";

const PricingPolicyFormModal = ({
  open,
  title,
  onCancel,
  form,
  loading,
  vehicleTypes = [],
  onSubmit,
}) => {
  const vehicleTypeOptions = vehicleTypes.map((type) => ({
    value: type.vehicleTypeId,
    label: type.typeName || `Type #${type.vehicleTypeId}`,
  }));

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={640}
      styles={{ body: { maxHeight: "70vh", overflowY: "auto" } }}
    >
      <Form form={form} layout="vertical" requiredMark={false} onFinish={onSubmit}>
        <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
          <Form.Item
            name="vehicleTypeId"
            label="Vehicle Type"
            rules={[{ required: true, message: "Please select a vehicle type." }]}
          >
            <Select
              size="large"
              placeholder="Select vehicle type"
              options={vehicleTypeOptions}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>

          <Form.Item
            name="policyName"
            label="Policy Name"
            rules={[{ required: true, message: "Please enter a policy name." }]}
          >
            <Input size="large" placeholder="e.g. Motorbike Standard Pricing" />
          </Form.Item>

          <Form.Item
            name="basePrice"
            label="Base Price"
            tooltip="Initial parking fee when a session starts"
            rules={[{ required: true, message: "Please enter the base price." }]}
          >
            <InputNumber size="large" min={0} className="w-full" addonAfter="VND" />
          </Form.Item>

          <Form.Item
            name="hourlyRate"
            label="Hourly Rate"
            tooltip="Fee charged per additional hour"
            rules={[{ required: true, message: "Please enter the hourly rate." }]}
          >
            <InputNumber size="large" min={0} className="w-full" addonAfter="VND" />
          </Form.Item>

          <Form.Item
            name="maxHours"
            label="Max Hours"
            tooltip="Maximum billable hours for this policy"
            rules={[{ required: true, message: "Please enter max hours." }]}
          >
            <InputNumber
              size="large"
              min={1}
              precision={0}
              className="w-full"
              addonAfter="hrs"
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            valuePropName="checked"
            getValueFromEvent={(checked) => (checked ? "ACTIVE" : "INACTIVE")}
            getValueProps={(value) => ({ checked: value === "ACTIVE" })}
            rules={[{ required: true, message: "Please set the policy status." }]}
          >
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>

          <Form.Item
            name="effectiveFrom"
            label="Effective From"
            rules={[{ required: true, message: "Please select a start date." }]}
          >
            <DatePicker showTime size="large" className="w-full" />
          </Form.Item>

          <Form.Item
            name="effectiveTo"
            label="Effective To"
            rules={[{ required: true, message: "Please select an end date." }]}
          >
            <DatePicker showTime size="large" className="w-full" />
          </Form.Item>
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Save
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default PricingPolicyFormModal;
