import { CarFront, Car, Lock, Wrench, LogOut } from "lucide-react";
import { Select, Spin } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import CommonBreadcrumb from "../../../components/Commandbreadcrumb/Commandbreadcrumb";
import { getBuildingListRequest } from "../../../redux/manager/Building/getBuildingList/getBuildingListSlice";
import {
  getBuildingFloorsRequest,
  resetBuildingFloors,
} from "../../../redux/manager/Building/getBuildingFloors/getBuildingFloorsSlice";
import { getZoneByFloorRequest } from "../../../redux/manager/Building/zone/getZoneByFloor/getZoneByFloorSlice";
import {
  clearGetSlotByZone,
  getSlotByZoneRequest,
} from "../../../redux/manager/Building/zone/getSlotByZone/getSlotByZoneSlice";
import { getOccupiedSlotRequest, clearGetOccupiedSlot } from "../../../redux/manager/Building/zone/getOccupiedSlot/getOccupiedSlotSlice";
import {
  normalizeSlotStatus,
  splitSlotsIntoTwoRows,
} from "../Building/utils/buildingUtils";
import { getSlotCardClass, SLOT_STATUS_LEGEND } from "./parkingUtils";
import SlotDetailModal from "./SlotDetailModal";

const mapSelectOptions = (items, labelKey = "name") =>
  (Array.isArray(items) ? items : [])
    .filter((item) => item?.id)
    .map((item) => ({
      value: item.id,
      label: item[labelKey] || item.zoneName || item.floorName || item.name || "N/A",
    }));

const resolveSlotStatus = (slot) =>
  normalizeSlotStatus(slot?.status ?? slot?.slotStatus);

const ParkingSlot = ({ slot, isSelected, onSelect }) => {
  const status = resolveSlotStatus(slot);
  const slotName = slot?.name || slot?.slotName || "—";
  const showName = status === "AVAILABLE" || status === "RESERVED";

  return (
    <button
      type="button"
      onClick={() => onSelect(slot)}
      className={getSlotCardClass(status, isSelected)}
    >
      {showName && <span>{slotName}</span>}
      {status === "OCCUPIED" && <Car size={28} strokeWidth={1.75} />}
      {status === "RESERVED" && (
        <Lock size={16} className="absolute bottom-2 right-2 opacity-90" />
      )}
      {status === "PENDING_EXIT" && (
        <>
          <LogOut size={22} strokeWidth={1.75} className="mb-1" />
          <span className="text-[10px]">{slotName}</span>
        </>
      )}
      {status === "MAINTENANCE" && <Wrench size={26} strokeWidth={1.75} />}
      {isSelected && (
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-blue-500 ring-2 ring-white" />
      )}
    </button>
  );
};

const ParkingSpacePage = () => {
  const dispatch = useDispatch();
  const [selectedBuildingId, setSelectedBuildingId] = useState(null);
  const [selectedFloorId, setSelectedFloorId] = useState(null);
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSlotName, setSelectedSlotName] = useState("");

  const { buildings, loading: buildingsLoading } = useSelector(
    (state) => state.getBuildingList
  );
  const { floors, loading: floorsLoading } = useSelector((state) => state.getBuildingFloors);
  const { getZoneByFloor: zones, loading: zonesLoading } = useSelector(
    (state) => state.getZoneByFloor
  );
  const { getSlotByZone: slots, loading: slotsLoading } = useSelector(
    (state) => state.getSlotByZone
  );

  const buildingOptions = useMemo(() => mapSelectOptions(buildings), [buildings]);
  const floorOptions = useMemo(
    () =>
      mapSelectOptions(floors, "name").map((opt) => {
        const floor = (Array.isArray(floors) ? floors : []).find((f) => f.id === opt.value);
        const label = floor?.name || floor?.floorName || opt.label;
        return { ...opt, label };
      }),
    [floors]
  );
  const zoneOptions = useMemo(
    () => (selectedFloorId ? mapSelectOptions(zones) : []),
    [zones, selectedFloorId]
  );

  const selectedBuilding = (Array.isArray(buildings) ? buildings : []).find(
    (b) => b.id === selectedBuildingId
  );
  const selectedFloor = (Array.isArray(floors) ? floors : []).find(
    (f) => f.id === selectedFloorId
  );
  const selectedZone = (Array.isArray(zones) ? zones : []).find((z) => z.id === selectedZoneId);
  const selectedZoneOption = zoneOptions.find((opt) => opt.value === selectedZoneId);

  const slotList = Array.isArray(slots) ? slots : [];
  const [topRow, bottomRow] = splitSlotsIntoTwoRows(slotList);
  const zoneDisplayName = selectedZoneOption?.label || selectedZone?.name || selectedZone?.zoneName;
  const laneLabel = zoneDisplayName && zoneDisplayName !== "N/A" ? `LANE ${zoneDisplayName}` : "LANE";

  useEffect(() => {
    dispatch(getBuildingListRequest());
  }, [dispatch]);

  useEffect(() => {
    if (!selectedBuildingId) {
      dispatch(resetBuildingFloors());
      return;
    }
    dispatch(getBuildingFloorsRequest(selectedBuildingId));
  }, [dispatch, selectedBuildingId]);

  useEffect(() => {
    if (!selectedFloorId) return;
    dispatch(getZoneByFloorRequest(selectedFloorId));
  }, [dispatch, selectedFloorId]);

  useEffect(() => {
    if (!selectedZoneId) {
      dispatch(clearGetSlotByZone());
      return;
    }
    dispatch(getSlotByZoneRequest(selectedZoneId));
  }, [dispatch, selectedZoneId]);

  const handleBuildingChange = (value) => {
    setSelectedBuildingId(value);
    setSelectedFloorId(null);
    setSelectedZoneId(null);
    setSelectedSlotId(null);
    setIsModalVisible(false);
    dispatch(clearGetSlotByZone());
  };

  const handleFloorChange = (value) => {
    setSelectedFloorId(value);
    setSelectedZoneId(null);
    setSelectedSlotId(null);
    dispatch(clearGetSlotByZone());
  };

  const handleZoneChange = (value) => {
    setSelectedZoneId(value);
    setSelectedSlotId(null);
    setIsModalVisible(false);
  };

  const handleSlotSelect = (item) => {
    setSelectedSlotId(item.id);
    setSelectedSlotName(item.name);
    const status = resolveSlotStatus(item);
    if (status === "OCCUPIED" || status === "RESERVED" || status === "PENDING_EXIT") {
      dispatch(clearGetOccupiedSlot());
      dispatch(getOccupiedSlotRequest({ slotId: item.id }));
      setIsModalVisible(true);
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    dispatch(clearGetOccupiedSlot());
  };

  return (
    <div className="min-h-screen bg-[#f3f0fa] p-6 md:p-8">
      <div className="mb-6 rounded-2xl border border-violet-100 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <CommonBreadcrumb role="Manager" page="space" />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-200 bg-violet-50 text-violet-600">
            <CarFront size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">
              Parking Space Management
            </h1>
            <p className="mt-1 font-medium text-slate-500">
              View and monitor parking slots by building, floor, and zone.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm md:p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Building
            </label>
            <Select
              className="w-full"
              placeholder="Select building"
              loading={buildingsLoading}
              options={buildingOptions}
              value={selectedBuildingId}
              onChange={handleBuildingChange}
              allowClear
              onClear={() => handleBuildingChange(null)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Floor
            </label>
            <Select
              className="w-full"
              placeholder="Select floor"
              loading={floorsLoading}
              options={floorOptions}
              value={selectedFloorId}
              onChange={handleFloorChange}
              disabled={!selectedBuildingId}
              allowClear
              onClear={() => handleFloorChange(null)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Area (Zone)
            </label>
            <Select
              className="w-full"
              placeholder="Select zone"
              loading={zonesLoading}
              options={zoneOptions}
              value={selectedZoneId}
              onChange={handleZoneChange}
              disabled={!selectedFloorId}
              allowClear
              onClear={() => handleZoneChange(null)}
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-5">
          {SLOT_STATUS_LEGEND.map((item) => (
            <div key={item.key} className="flex items-center gap-2 text-sm text-slate-600">
              <span className={`h-5 w-8 rounded-md ${item.swatchClass}`} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-violet-100 bg-white p-6 shadow-sm md:p-8">
        {!selectedZoneId ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
            <p className="text-base font-medium text-slate-600">
              Select a building, floor, and zone to view parking slots.
            </p>
            {selectedBuilding && selectedFloor && !selectedZoneId && (
              <p className="mt-1 text-sm text-slate-400">
                {selectedBuilding.name} · {selectedFloor.name || selectedFloor.floorName}
              </p>
            )}
          </div>
        ) : slotsLoading ? (
          <div className="flex min-h-[280px] items-center justify-center">
            <Spin size="large" />
          </div>
        ) : slotList.length === 0 ? (
          <div className="flex min-h-[280px] items-center justify-center text-sm text-slate-500">
            No slots in this zone.
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-center text-sm font-semibold text-slate-500">
              {selectedBuilding?.name} · {selectedFloor?.name || selectedFloor?.floorName} · {" "}
              {zoneDisplayName || "Zone"}
            </p>

            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
              {topRow.map((slot) => (
                <ParkingSlot
                  key={slot.id || slot.name}
                  slot={slot}
                  isSelected={selectedSlotId === slot.id}
                  onSelect={handleSlotSelect}
                />
              ))}
            </div>

            <div className="relative flex items-center justify-center py-2">
              <div className="absolute inset-x-0 top-1/2 border-t-2 border-dashed border-violet-200" />
              <span className="relative bg-white px-4 text-xs font-bold tracking-[0.2em] text-violet-400">
                &lt;&lt; {laneLabel} &lt;&lt;
              </span>
            </div>

            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
              {bottomRow.map((slot) => (
                <ParkingSlot
                  key={slot.id || slot.name}
                  slot={slot}
                  isSelected={selectedSlotId === slot.id}
                  onSelect={handleSlotSelect}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <SlotDetailModal 
        visible={isModalVisible} 
        onClose={handleModalClose} 
        slotName={selectedSlotName}
      />
    </div>
  );
};

export default ParkingSpacePage;
