import { Building2, Trash2 } from "lucide-react";
import { Button, Modal, Popconfirm, Spin, Tag } from "antd";

const getBuildingId = (building) => building?.id || building?.buildingId;
const getStaffId = (staff) => staff?.userId || staff?.staffId || staff?.id;

const StaffBuildingsModal = ({
  open,
  onCancel,
  staff,
  buildings = [],
  loading,
  removeLoading,
  onRemove,
}) => (
  <Modal
    title="Assigned Buildings"
    open={open}
    onCancel={onCancel}
    footer={<Button onClick={onCancel}>Close</Button>}
    width={520}
  >
    {staff && (
      <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <p className="text-sm font-semibold text-slate-800">
          {staff.fullName || staff.email || "Staff"}
        </p>
        {staff.email && <p className="text-xs text-slate-500">{staff.email}</p>}
      </div>
    )}

    {loading ? (
      <div className="flex min-h-[120px] items-center justify-center">
        <Spin />
      </div>
    ) : buildings.length === 0 ? (
      <p className="rounded-lg border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
        No buildings assigned yet.
      </p>
    ) : (
      <div className="space-y-2">
        {buildings.map((building) => {
          const buildingId = getBuildingId(building);
          return (
            <div
              key={buildingId}
              className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-indigo-500" />
                <span className="font-medium text-slate-700">
                  {building.name || building.buildingName || "N/A"}
                </span>
                {building.status && (
                  <Tag
                    color={building.status === "ACTIVE" ? "green" : "gold"}
                    className="m-0"
                  >
                    {building.status}
                  </Tag>
                )}
              </div>

              <Popconfirm
                title="Remove staff from this building?"
                onConfirm={() =>
                  onRemove({ buildingId, userId: getStaffId(staff) })
                }
                okText="Remove"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <Button
                  danger
                  size="small"
                  icon={<Trash2 size={14} />}
                  loading={removeLoading}
                >
                  Remove
                </Button>
              </Popconfirm>
            </div>
          );
        })}
      </div>
    )}
  </Modal>
);

export default StaffBuildingsModal;
