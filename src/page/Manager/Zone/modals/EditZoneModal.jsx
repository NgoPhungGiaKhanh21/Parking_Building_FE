import { Button, Form, Input, InputNumber, Modal } from "antd";
import { useEffect } from "react";

const EditZoneModal = ({
  open,
  onCancel,
  form,
  loading,
  onSubmit,
  zone,
  floorName,
}) => {
  // Pre-fill form when modal opens with selected zone data
  useEffect(() => {
    if (open && zone) {
      form.setFieldsValue({
        zoneName: zone.name || zone.zoneName || "",
        maxCapacity: zone.maxCapacity ?? "",
        slotPrefix: zone.slotPrefix || "",
      });
    }
  }, [open, zone, form]);

  return (
    <Modal
      title={
        <span>
          Edit Zone - <span className="font-semibold">{floorName}</span>
        </span>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={520}
      destroyOnHidden
    >
      {/* Current zone info */}
      <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
        <p>
          <span className="font-semibold text-slate-700">Zone: </span>
          {zone?.name || zone?.zoneName || "N/A"}
        </p>
        <p>
          <span className="font-semibold text-slate-700">Current Max Capacity: </span>
          {zone?.maxCapacity ?? "N/A"}
        </p>
        <p>
          <span className="font-semibold text-slate-700">Slot Prefix: </span>
          {zone?.slotPrefix || "N/A"}
        </p>
      </div>

      <Form form={form} layout="vertical" requiredMark={false} onFinish={onSubmit}>
        <Form.Item
          name="zoneName"
          label="Zone Name"
          rules={[{ required: true, message: "Please enter zone name." }]}
        >
          <Input placeholder="Example: B" />
        </Form.Item>

        <Form.Item
          name="maxCapacity"
          label="Max Capacity"
          rules={[
            { required: true, message: "Please enter max capacity." },
            {
              validator: (_, value) => {
                if (value == null || value === "") return Promise.resolve();
                if (Number(value) < 1) {
                  return Promise.reject(new Error("Max capacity must be at least 1."));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <InputNumber min={1} precision={0} className="w-full!" />
        </Form.Item>

        <Form.Item
          name="slotPrefix"
          label="Slot Prefix"
          rules={[{ required: true, message: "Please enter slot prefix." }]}
        >
          <Input placeholder="Example: B" />
        </Form.Item>

        <Button htmlType="submit" type="primary" loading={loading} className="w-full">
          Update Zone
        </Button>
      </Form>
    </Modal>
  );
};

export default EditZoneModal;
