import { Modal, Spin, Tag } from "antd";
import { Wrench } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  normalizeSlotStatus,
  sortSlotsNatural,
} from "../../Building/utils/buildingUtils";
import { updateSlotStatusRequest } from "../../../../redux/manager/Building/zone/updateSlotStatus/updateSlotStatusSlice";
import { updateZoneStatusRequest } from "../../../../redux/manager/Building/zone/updateZoneStatus/updateZoneStatusSlice";

const SLOT_STATUS_STYLES = {
  AVAILABLE: {
    tagColor: "green",
    bg: "bg-emerald-50",
    border: "border-emerald-300",
    label: "Available",
  },
  MAINTENANCE: {
    tagColor: "orange",
    bg: "bg-orange-50",
    border: "border-orange-300",
    label: "Maintenance",
  },
};

const getSlotStyle = (status) =>
  SLOT_STATUS_STYLES[status] || SLOT_STATUS_STYLES.AVAILABLE;

const ZoneSlotListModal = ({ open, onCancel, zoneName, loading, zoneId, slots, floorId, zoneStatus, isParentMaintenance }) => {
  const dispatch = useDispatch();
  const { updatingSlotId } = useSelector((state) => state.updateSlotStatus);

  // Zone management: only show slots manager can toggle (hide pending exit / occupied / reserved)
  const filteredSlots = Array.isArray(slots)
    ? slots.filter((slot) => {
        const status = normalizeSlotStatus(slot.status ?? slot.slotStatus);
        return status === "AVAILABLE" || status === "MAINTENANCE";
      })
    : [];
  const slotList = sortSlotsNatural(filteredSlots);

  const handleSlotStatusToggle = (slot) => {
    const currentStatus = normalizeSlotStatus(slot.status ?? slot.slotStatus);
    // Only toggle between AVAILABLE and MAINTENANCE
    if (currentStatus !== "AVAILABLE" && currentStatus !== "MAINTENANCE") return;
    const newStatus = currentStatus === "AVAILABLE" ? "MAINTENANCE" : "AVAILABLE";
    dispatch(
      updateSlotStatusRequest({
        slotId: slot.id,
        zoneId,
        status: newStatus,
        floorId,
      })
    );

    // If changing from MAINTENANCE to AVAILABLE, also update Zone to ACTIVE if needed
    if (newStatus === "AVAILABLE" && normalizeSlotStatus(zoneStatus) !== "ACTIVE") {
      dispatch(
        updateZoneStatusRequest({
          zoneId,
          status: "ACTIVE",
          floorId,
        })
      );
    }
  };

  return (
    <Modal
      title={
        <span>
          Slots - <span className="font-semibold">{zoneName}</span>
        </span>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={560}
    >
      {loading ? (
        <div className="flex min-h-[120px] items-center justify-center">
          <Spin />
        </div>
      ) : slotList.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
          No available or maintenance slots found in this zone.
        </div>
      ) : (
        <>
          {/* Legend */}
          <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Legend:</span>
            {Object.entries(SLOT_STATUS_STYLES).map(([key, style]) => (
              <span key={key} className="flex items-center gap-1">
                <span className={`inline-block h-3 w-3 rounded-sm border ${style.border} ${style.bg}`} />
                {style.label}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {slotList.map((slot) => {
              const status = normalizeSlotStatus(slot.status ?? slot.slotStatus);
              const style = getSlotStyle(status);
              const canToggle = true; // All slots here are toggleable
              const isUpdating = updatingSlotId === slot.id;

              return (
                <div
                  key={slot.id || slot.name}
                  className={`rounded-xl border-2 ${style.border} ${style.bg} p-3 transition-all duration-200 ${
                    !isParentMaintenance ? "cursor-pointer hover:shadow-md" : "cursor-not-allowed"
                  } ${
                    isUpdating || isParentMaintenance ? "opacity-50" : ""
                  }`}
                  onClick={() => !isUpdating && !isParentMaintenance && handleSlotStatusToggle(slot)}
                  title={isParentMaintenance ? "Cannot change slot status while floor/building is in maintenance" : `Click to set ${status === "AVAILABLE" ? "MAINTENANCE" : "AVAILABLE"}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-800">
                      {slot.name || "—"}
                    </span>
                    <Tag color={style.tagColor} className="m-0 text-[10px]">
                      {status === "MAINTENANCE" && (
                        <Wrench size={10} className="mr-0.5 inline" />
                      )}
                      {style.label}
                    </Tag>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-4 text-center text-xs text-slate-400">
            Click an Available or Maintenance slot to toggle its status.
          </p>
        </>
      )}
    </Modal>
  );
};

export default ZoneSlotListModal;
