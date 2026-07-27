import { Modal, Spin } from "antd";
import { formatTime } from "../utils/buildingUtils";

const BuildingDetailModal = ({
  open,
  onCancel,
  loading,
  buildingDetail,
  buildingImage,
}) => {
  return (
    <Modal
      title={<div className="font-bold text-center">Building Detail</div>}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={640}
    >
      {loading ? (
        <div className="flex min-h-[260px] items-center justify-center">
          <Spin size="large" />
        </div>
      ) : (
        <div className="space-y-3">
          <img
            src={buildingImage}
            alt="Building detail"
            className="h-48 w-full rounded-lg object-cover"
          />

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Basic Information
            </p>
            <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
              <p>
                <span className="font-semibold">Name:</span>{" "}
                {buildingDetail?.name || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Status:</span>{" "}
                {buildingDetail?.status || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Address:</span>{" "}
                {buildingDetail?.address || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Contact:</span>{" "}
                {buildingDetail?.contactNumber || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Total Floors:</span>{" "}
                {buildingDetail?.totalFloors ?? "N/A"}
              </p>
              <p>
                <span className="font-semibold">Start Time:</span>{" "}
                {formatTime(buildingDetail?.operatingStartTime)}
              </p>
              <p>
                <span className="font-semibold">End Time:</span>{" "}
                {formatTime(buildingDetail?.operatingEndTime)}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              System Statistics
            </p>
            <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
              <p>
                <span className="font-semibold">Created Floors:</span>{" "}
                {buildingDetail?.floorCount ?? 0}
              </p>
              <p>
                <span className="font-semibold">Zone Count:</span>{" "}
                {buildingDetail?.zoneCount ?? 0}
              </p>
              <p>
                <span className="font-semibold">Slot Count:</span>{" "}
                {buildingDetail?.slotCount ?? 0}
              </p>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              These values are calculated by the system after you create floors,
              zones, and slots.
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default BuildingDetailModal;
