import { Button, DatePicker, Form, Input, InputNumber, Modal, Select } from "antd";

const PRICING_TYPES = [
  { value: "HOURLY", label: "Hourly" },
  { value: "DAILY", label: "Daily" },
  { value: "FLAT", label: "Flat" },
];

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

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
    <Modal title={title} open={open} onCancel={onCancel} footer={null} width={720}>
      <Form form={form} layout="vertical" requiredMark={false} onFinish={onSubmit}>
        <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
          <Form.Item
            name="policyName"
            label="Policy Name"
            rules={[{ required: true, message: "Please enter policy name." }]}
            className="md:col-span-2"
          >
            <Input size="large" placeholder="Enter policy name" />
          </Form.Item>

          <Form.Item
            name="vehicleTypeId"
            label="Vehicle Type"
            rules={[{ required: true, message: "Please select vehicle type." }]}
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
            name="pricingType"
            label="Pricing Type"
            rules={[{ required: true, message: "Please select pricing type." }]}
          >
            <Select size="large" placeholder="Select pricing type" options={PRICING_TYPES} />
          </Form.Item>

          <Form.Item
            name="basePrice"
            label="Base Price"
            rules={[{ required: true, message: "Please enter base price." }]}
          >
            <InputNumber size="large" min={0} className="w-full" />
          </Form.Item>

          <Form.Item
            name="hourlyRate"
            label="Hourly Rate"
            rules={[{ required: true, message: "Please enter hourly rate." }]}
          >
            <InputNumber size="large" min={0} className="w-full" />
          </Form.Item>

          <Form.Item name="overnightFee" label="Overnight Fee">
            <InputNumber size="large" min={0} className="w-full" />
          </Form.Item>

          <Form.Item name="lostTicketFee" label="Lost Ticket Fee">
            <InputNumber size="large" min={0} className="w-full" />
          </Form.Item>

          <Form.Item name="peakHourMultiplier" label="Peak Hour Multiplier">
            <InputNumber size="large" min={0} step={0.1} className="w-full" />
          </Form.Item>

          <Form.Item name="maxDailyFee" label="Max Daily Fee">
            <InputNumber size="large" min={0} className="w-full" />
          </Form.Item>

          <Form.Item
            name="effectiveFrom"
            label="Effective From"
            rules={[{ required: true, message: "Please select start date." }]}
          >
            <DatePicker showTime size="large" className="w-full" />
          </Form.Item>

          <Form.Item
            name="effectiveTo"
            label="Effective To"
            rules={[{ required: true, message: "Please select end date." }]}
          >
            <DatePicker showTime size="large" className="w-full" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: "Please select status." }]}
          >
            <Select size="large" options={STATUS_OPTIONS} />
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
