import { Button, DatePicker, Form, Input, InputNumber, Modal, Select } from "antd";

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Đang áp dụng" },
  { value: "INACTIVE", label: "Ngừng áp dụng" },
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
            label="vehicleTypeId"
            rules={[{ required: true, message: "Vui lòng chọn loại xe." }]}
          >
            <Select
              size="large"
              placeholder="Chọn loại xe"
              options={vehicleTypeOptions}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>

          <Form.Item
            name="policyName"
            label="policyName"
            rules={[{ required: true, message: "Vui lòng nhập tên chính sách." }]}
          >
            <Input size="large" placeholder="VD: Motorbike Standard Pricing" />
          </Form.Item>

          <Form.Item
            name="basePrice"
            label="basePrice"
            rules={[{ required: true, message: "Vui lòng nhập basePrice." }]}
          >
            <InputNumber size="large" min={0} className="w-full" addonAfter="đ" />
          </Form.Item>

          <Form.Item
            name="hourlyRate"
            label="hourlyRate"
            rules={[{ required: true, message: "Vui lòng nhập hourlyRate." }]}
          >
            <InputNumber size="large" min={0} className="w-full" addonAfter="đ" />
          </Form.Item>

          <Form.Item
            name="maxHours"
            label="maxHours"
            rules={[{ required: true, message: "Vui lòng nhập maxHours." }]}
          >
            <InputNumber size="large" min={1} precision={0} className="w-full" addonAfter="giờ" />
          </Form.Item>

          <Form.Item
            name="status"
            label="status"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái." }]}
          >
            <Select size="large" options={STATUS_OPTIONS} />
          </Form.Item>

          <Form.Item
            name="effectiveFrom"
            label="effectiveFrom"
            rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu." }]}
          >
            <DatePicker showTime size="large" className="w-full" />
          </Form.Item>

          <Form.Item
            name="effectiveTo"
            label="effectiveTo"
            rules={[{ required: true, message: "Vui lòng chọn ngày kết thúc." }]}
          >
            <DatePicker showTime size="large" className="w-full" />
          </Form.Item>
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <Button onClick={onCancel}>Hủy</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Lưu
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default PricingPolicyFormModal;
