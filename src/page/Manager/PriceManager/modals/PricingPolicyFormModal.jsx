import { Button, DatePicker, Divider, Form, Input, InputNumber, Modal, Select } from "antd";
import { TIER_PRICING_CONFIG } from "../utils/pricingPolicyUtils";

const PRICING_TYPES = [
  { value: "TIERED", label: "Theo bậc (Tiered)" },
  { value: "HOURLY", label: "Theo giờ (Hourly)" },
  { value: "DAILY", label: "Theo ngày (Daily)" },
  { value: "FLAT", label: "Giá cố định (Flat)" },
];

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
      width={820}
      styles={{ body: { maxHeight: "70vh", overflowY: "auto" } }}
    >
      <Form form={form} layout="vertical" requiredMark={false} onFinish={onSubmit}>
        <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
          <Form.Item
            name="policyName"
            label="Tên chính sách"
            rules={[{ required: true, message: "Vui lòng nhập tên chính sách." }]}
            className="md:col-span-2"
          >
            <Input size="large" placeholder="VD: Motorbike Standard Pricing" />
          </Form.Item>

          <Form.Item
            name="vehicleTypeId"
            label="Loại xe"
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
            name="pricingType"
            label="Kiểu tính phí"
            rules={[{ required: true, message: "Vui lòng chọn kiểu tính phí." }]}
          >
            <Select size="large" placeholder="Chọn kiểu tính phí" options={PRICING_TYPES} />
          </Form.Item>

          <Form.Item
            name="basePrice"
            label="Giá cơ bản"
            rules={[{ required: true, message: "Vui lòng nhập giá cơ bản." }]}
          >
            <InputNumber size="large" min={0} className="w-full" addonAfter="đ" />
          </Form.Item>

          <Form.Item
            name="hourlyRate"
            label="Giá mỗi giờ"
            rules={[{ required: true, message: "Vui lòng nhập giá mỗi giờ." }]}
          >
            <InputNumber size="large" min={0} className="w-full" addonAfter="đ" />
          </Form.Item>

          <Form.Item name="overnightFee" label="Phí qua đêm">
            <InputNumber size="large" min={0} className="w-full" addonAfter="đ" />
          </Form.Item>

          <Form.Item name="lostTicketFee" label="Phí mất vé">
            <InputNumber size="large" min={0} className="w-full" addonAfter="đ" />
          </Form.Item>

          <Form.Item name="peakHourMultiplier" label="Hệ số giờ cao điểm">
            <InputNumber size="large" min={0} step={0.1} className="w-full" />
          </Form.Item>

          <Form.Item name="maxDailyFee" label="Phí tối đa / ngày">
            <InputNumber size="large" min={0} className="w-full" addonAfter="đ" />
          </Form.Item>

          <Form.Item
            name="perDayPrice"
            label="Phụ phí mỗi ngày tiếp theo"
            tooltip="Sau 24 giờ, mỗi ngày gửi thêm sẽ cộng thêm mức phí này"
          >
            <InputNumber size="large" min={0} className="w-full" addonAfter="đ/ngày" />
          </Form.Item>

          <Form.Item
            name="effectiveFrom"
            label="Hiệu lực từ"
            rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu." }]}
          >
            <DatePicker showTime size="large" className="w-full" />
          </Form.Item>

          <Form.Item
            name="effectiveTo"
            label="Hiệu lực đến"
            rules={[{ required: true, message: "Vui lòng chọn ngày kết thúc." }]}
          >
            <DatePicker showTime size="large" className="w-full" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái." }]}
          >
            <Select size="large" options={STATUS_OPTIONS} />
          </Form.Item>
        </div>

        <Divider className="!my-4">Cách tính phí theo bậc</Divider>

        <div className="mb-4 rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-semibold">Bảng tham khảo:</p>
          <ul className="mt-1 list-inside list-disc space-y-0.5">
            <li>≤ 2 giờ → phí bậc 1</li>
            <li>&gt; 2h – 6h → phí bậc 2</li>
            <li>&gt; 6h – 12h → phí bậc 3</li>
            <li>&gt; 12h – 24h → phí bậc 4</li>
            <li>Mỗi ngày tiếp theo → cộng thêm phụ phí/ngày</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {TIER_PRICING_CONFIG.map((tier) => (
            <div
              key={tier.hours}
              className="rounded-xl border border-slate-200 bg-slate-50/50 p-3"
            >
              <p className="font-semibold text-slate-800">{tier.rangeLabel}</p>
              <p className="mb-3 text-xs text-slate-500">{tier.description}</p>
              <div className="grid grid-cols-2 gap-3">
                <Form.Item name={tier.hours} label={tier.hoursLabel}>
                  <InputNumber
                    size="large"
                    min={0}
                    precision={0}
                    className="w-full"
                    addonAfter="giờ"
                  />
                </Form.Item>
                <Form.Item name={tier.price} label={tier.priceLabel}>
                  <InputNumber
                    size="large"
                    min={0}
                    className="w-full"
                    addonAfter="đ"
                  />
                </Form.Item>
              </div>
            </div>
          ))}
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
