import { PenSquare } from "lucide-react";
import { Button, Form, Input, InputNumber, Modal, Select, Spin, Tag } from "antd";

const FloorManagementModal = ({
  open,
  onCancel,
  floorBuilding,
  floorForm,
  createFloorLoading,
  onCreateFloor,
  vehicleTypeOptions,
  vehicleTypesLoading,
  floors,
  floorsLoading,
  onRefresh,
  onEditFloor,
  onSelectFloor,
}) => {
  return (
    <Modal
      title={
        <span>
          Floor Management - <span className="font-semibold">{floorBuilding?.name}</span>
        </span>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={920}
    >
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-4">
          <h3 className="mb-3 text-base font-semibold text-slate-800">Create Floor</h3>
          <Form
            form={floorForm}
            layout="vertical"
            requiredMark={false}
            onFinish={onCreateFloor}
          >
            <Form.Item
              name="floorName"
              label="Floor Name"
              rules={[{ required: true, message: "Please enter floor name." }]}
            >
              <Input placeholder="Example: Tang xe may" />
            </Form.Item>

            <Form.Item
              name="vehicleTypeId"
              label="Vehicle Type"
              rules={[{ required: true, message: "Please select vehicle type." }]}
            >
              <Select
                loading={vehicleTypesLoading}
                placeholder="Select vehicle type"
                options={vehicleTypeOptions}
                notFoundContent={vehicleTypesLoading ? <Spin size="small" /> : "No data"}
              />
            </Form.Item>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Form.Item
                name="floorLevel"
                label="Floor Level"
                rules={[{ required: true, message: "Please enter floor level." }]}
              >
                <InputNumber min={1} precision={0} className="w-full!" />
              </Form.Item>
              <Form.Item
                name="maxCapacity"
                label="Max Capacity"
                rules={[{ required: true, message: "Please enter max capacity." }]}
              >
                <InputNumber min={1} precision={0} className="w-full!" />
              </Form.Item>
            </div>

            <Button htmlType="submit" type="primary" loading={createFloorLoading} className="w-full">
              Create Floor
            </Button>
          </Form>
        </div>

        <div className="rounded-xl border border-slate-200 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-800">Existing Floors</h3>
            <Button size="small" onClick={onRefresh}>
              Refresh
            </Button>
          </div>

          {floorsLoading ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <Spin />
            </div>
          ) : (Array.isArray(floors) ? floors : []).length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
              No floors yet. Create your first floor on the left.
            </div>
          ) : (
            <div className="space-y-3">
              {(Array.isArray(floors) ? floors : []).map((floor) => (
                <div
                  key={floor.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectFloor?.(floor)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelectFloor?.(floor);
                    }
                  }}
                  className="cursor-pointer rounded-lg border border-slate-200 bg-slate-50 p-3 transition hover:border-indigo-300 hover:bg-indigo-50/40"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <p className="font-semibold text-slate-800">
                      {floor.name || floor.floorName || "N/A"}
                    </p>
                    <div className="flex items-center gap-2">
                      <Tag color="blue">Level {floor.level ?? floor.floorLevel ?? "N/A"}</Tag>
                      <Button
                        size="small"
                        type="text"
                        icon={<PenSquare size={14} />}
                        onClick={(event) => {
                          event.stopPropagation();
                          onEditFloor(floor);
                        }}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">
                    Vehicle Type:{" "}
                    <span className="font-medium text-slate-700">
                      {floor.vehicleTypeName || floor.vehicleType || "N/A"}
                    </span>
                  </p>
                  <p className="text-sm text-slate-600">
                    Capacity:{" "}
                    <span className="font-medium text-slate-700">{floor.maxCapacity ?? 0}</span>
                  </p>
                  <p className="mt-2 text-xs font-medium text-indigo-600">View zones →</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default FloorManagementModal;
