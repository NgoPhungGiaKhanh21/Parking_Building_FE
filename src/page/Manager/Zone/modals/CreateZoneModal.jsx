import { Button, Form, Input, InputNumber, Modal } from "antd";

const CreateZoneModal = ({
  open,
  onCancel,
  form,
  loading,
  onSubmit,
  floorName,
  floorMaxCapacity,
  usedCapacity,
  remainingCapacity,
}) => {
  const isFloorFull = remainingCapacity <= 0;

  return (
    <Modal
      title={
        <span>
          Create Zone - <span className="font-semibold">{floorName}</span>
        </span>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={520}
      destroyOnHidden
    >
      <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
        <p>
          <span className="font-semibold text-slate-700">Floor capacity: </span>
          {floorMaxCapacity ?? "N/A"}
        </p>
        <p>
          <span className="font-semibold text-slate-700">Used by zones: </span>
          {usedCapacity}
        </p>
        <p>
          <span className="font-semibold text-slate-700">Remaining: </span>
          <span className={isFloorFull ? "font-semibold text-red-600" : "font-semibold text-emerald-600"}>
            {Math.max(remainingCapacity, 0)}
          </span>
        </p>
      </div>

      {isFloorFull ? (
        <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50 p-4 text-center text-sm text-amber-800">
          Floor capacity is fully allocated. Cannot create more zones.
        </div>
      ) : (
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
                  if (Number(value) > remainingCapacity) {
                    return Promise.reject(
                      new Error(
                        `Cannot exceed remaining floor capacity (${remainingCapacity}).`
                      )
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber min={1} max={remainingCapacity} precision={0} className="w-full!" />
          </Form.Item>

          <Form.Item
            name="slotPrefix"
            label="Slot Prefix"
            rules={[{ required: true, message: "Please enter slot prefix." }]}
          >
            <Input placeholder="Example: B" />
          </Form.Item>

          <Button htmlType="submit" type="primary" loading={loading} className="w-full">
            Create Zone
          </Button>
        </Form>
      )}
    </Modal>
  );
};

export default CreateZoneModal;
