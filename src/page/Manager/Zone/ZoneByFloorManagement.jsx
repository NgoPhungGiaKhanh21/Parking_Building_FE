import { ArrowLeft, Layers, Pencil, Wrench } from "lucide-react";
import { Button, Form, Spin, message, Tag } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useParams } from "react-router-dom";
import CommonBreadcrumb from "../../../components/Commandbreadcrumb/Commandbreadcrumb";
import { getZoneByFloorRequest } from "../../../redux/manager/Building/zone/getZoneByFloor/getZoneByFloorSlice";
import {
  createZoneRequest,
  resetCreateZoneStatus,
} from "../../../redux/manager/Building/zone/createZone/createZoneSlice";
import {
  clearGetSlotByZone,
  getSlotByZoneRequest,
} from "../../../redux/manager/Building/zone/getSlotByZone/getSlotByZoneSlice";
import { updateZoneStatusRequest } from "../../../redux/manager/Building/zone/updateZoneStatus/updateZoneStatusSlice";
import {
  updateZoneRequest,
  resetUpdateZoneStatus,
} from "../../../redux/manager/Building/zone/updateZone/updateZoneSlice";
import CreateZoneModal from "./modals/CreateZoneModal";
import EditZoneModal from "./modals/EditZoneModal";
import ZoneSlotListModal from "./modals/ZoneSlotListModal";
import {
  FLOOR_CONTEXT_STORAGE_PREFIX,
  getRemainingFloorCapacity,
  pickZoneDisplayFields,
  sumZoneCapacities,
  getStatusStyle,
  normalizeStatus,
} from "../Building/utils/buildingUtils";

const ZONE_STATUSES = ["ACTIVE", "INACTIVE", "MAINTENANCE"];

const readFloorContext = (floorId, floorSlug, locationState) => {
  if (locationState?.floorId) return locationState;

  if (floorId) {
    try {
      const stored = sessionStorage.getItem(
        `${FLOOR_CONTEXT_STORAGE_PREFIX}${floorId}`,
      );
      if (stored) return JSON.parse(stored);
    } catch {
      // fall through to URL fallback
    }
    return {
      floorId,
      floorName: floorSlug,
    };
  }

  return null;
};

const getZoneTitle = (zone, index) => {
  const displayFields = pickZoneDisplayFields(zone);
  return (
    zone.name ||
    displayFields.find((field) => field.key === "name")?.value ||
    `Zone ${index + 1}`
  );
};

const ZoneByFloorManagement = () => {
  const dispatch = useDispatch();
  const { floorId, floorSlug } = useParams();
  const location = useLocation();
  const [zoneForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEditZone, setSelectedEditZone] = useState(null);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [selectedZoneName, setSelectedZoneName] = useState("");
  const [selectedMasterZoneId, setSelectedMasterZoneId] = useState(null);
  const [selectedSlotZoneId, setSelectedSlotZoneId] = useState(null);

  const floorContext = useMemo(
    () => readFloorContext(floorId, floorSlug, location.state),
    [floorId, floorSlug, location.state],
  );

  const { loading, getZoneByFloor: zones } = useSelector(
    (state) => state.getZoneByFloor,
  );
  const { loading: createZoneLoading, success: createZoneSuccess } =
    useSelector((state) => state.createZone);
  const { loading: updateZoneLoading, success: updateZoneSuccess } =
    useSelector((state) => state.updateZone);
  const { loading: slotsLoading, getSlotByZone: slots } = useSelector(
    (state) => state.getSlotByZone,
  );

  const zoneList = Array.isArray(zones) ? zones : [];
  const floorName = floorContext?.floorName || floorSlug || "Floor";
  const buildingName = floorContext?.buildingName;
  const floorMaxCapacity = Number(floorContext?.maxCapacity);
  const usedCapacity = sumZoneCapacities(zoneList);
  const remainingCapacity = getRemainingFloorCapacity(
    floorMaxCapacity,
    zoneList,
  );
  const canCreateZone =
    floorContext?.floorId &&
    Number.isFinite(floorMaxCapacity) &&
    floorMaxCapacity > 0 &&
    remainingCapacity > 0;

  const selectedMasterZone = useMemo(
    () => zoneList.find((z) => z.id === selectedMasterZoneId) || null,
    [zoneList, selectedMasterZoneId]
  );

  const isParentMaintenance =
    normalizeStatus(floorContext?.buildingStatus) === "MAINTENANCE" ||
    normalizeStatus(floorContext?.floorStatus) === "MAINTENANCE";

  useEffect(() => {
    if (zoneList.length > 0 && !selectedMasterZoneId) {
      setSelectedMasterZoneId(zoneList[0].id);
    } else if (zoneList.length === 0) {
      setSelectedMasterZoneId(null);
    }
  }, [zoneList, selectedMasterZoneId]);

  useEffect(() => {
    if (floorContext?.floorId) {
      dispatch(getZoneByFloorRequest(floorContext.floorId));
    }
  }, [dispatch, floorContext?.floorId]);

  useEffect(() => {
    if (createZoneSuccess) {
      zoneForm.resetFields();
      dispatch(resetCreateZoneStatus());
      setTimeout(() => setIsCreateModalOpen(false), 0);
    }
  }, [createZoneSuccess, dispatch, zoneForm]);

  useEffect(() => {
    if (updateZoneSuccess) {
      editForm.resetFields();
      dispatch(resetUpdateZoneStatus());
      setSelectedEditZone(null);
      setTimeout(() => setIsEditModalOpen(false), 0);
    }
  }, [updateZoneSuccess, dispatch, editForm]);

  const handleRefresh = () => {
    if (floorContext?.floorId) {
      dispatch(getZoneByFloorRequest(floorContext.floorId));
    }
  };

  const handleOpenCreateModal = () => {
    if (!canCreateZone) {
      message.warning("Floor capacity is full. Cannot create more zones.");
      return;
    }
    setIsCreateModalOpen(true);
  };

  const handleCreateZone = (values) => {
    if (!floorContext?.floorId) return;

    const newCapacity = Number(values.maxCapacity);
    if (usedCapacity + newCapacity > floorMaxCapacity) {
      message.error(
        `Total zone capacity cannot exceed floor capacity (${floorMaxCapacity}). Remaining: ${remainingCapacity}.`,
      );
      return;
    }

    dispatch(
      createZoneRequest({
        floorId: floorContext.floorId,
        data: {
          zoneName: values.zoneName?.trim(),
          maxCapacity: newCapacity,
          slotPrefix: values.slotPrefix?.trim(),
        },
      }),
    );
  };

  const handleSelectZone = (zone, title) => {
    if (!zone?.id) return;
    setSelectedZoneName(title);
    setSelectedSlotZoneId(zone.id);
    setIsSlotModalOpen(true);
    dispatch(getSlotByZoneRequest(zone.id));
  };

  const handleCloseSlotModal = () => {
    setIsSlotModalOpen(false);
    setSelectedZoneName("");
    setSelectedSlotZoneId(null);
    dispatch(clearGetSlotByZone());
  };

  const handleToggleStatus = (zoneId, newStatus) => {
    if (!zoneId) return;
    dispatch(
      updateZoneStatusRequest({
        zoneId: zoneId,
        status: newStatus,
        floorId: floorContext?.floorId,
      }),
    );
  };

  const handleOpenEditModal = (zone) => {
    setSelectedEditZone(zone);
    setIsEditModalOpen(true);
  };

  const handleUpdateZone = (values) => {
    if (!selectedEditZone?.id || !floorContext?.floorId) return;
    dispatch(
      updateZoneRequest({
        zoneId: selectedEditZone.id,
        floorId: floorContext.floorId,
        zoneName: values.zoneName?.trim(),
        maxCapacity: Number(values.maxCapacity),
        slotPrefix: values.slotPrefix?.trim(),
      }),
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8">
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <CommonBreadcrumb
            role="Manager"
            page="building"
            subPage="floormanagement"
            thirdPage="zonemanagement"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600">
            <Layers size={28} strokeWidth={2.5} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">
              Zone Management - {floorName}
            </h1>
            <p className="mt-1 font-medium text-slate-500">
              {buildingName
                ? `Zones on ${floorName} in ${buildingName}.`
                : `List of zones on ${floorName}.`}
            </p>
            {Number.isFinite(floorMaxCapacity) && (
              <p className="mt-1 text-sm text-slate-500">
                Capacity: {usedCapacity}/{floorMaxCapacity} used (
                {remainingCapacity} remaining)
              </p>
            )}
          </div>
          <Link
            to={
              floorContext?.buildingId
                ? `/manager/building/floors/${floorContext.buildingId}`
                : "/manager/building"
            }
          >
            <Button icon={<ArrowLeft size={16} />}>
              Back to Floor Management
            </Button>
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Existing Zones</h2>
          <div className="flex items-center gap-2">
            <Button
              size="small"
              onClick={handleRefresh}
              disabled={!floorContext?.floorId}
            >
              Refresh
            </Button>
            <Button
              type="primary"
              size="small"
              onClick={handleOpenCreateModal}
              disabled={!canCreateZone}
            >
              Create Zone
            </Button>
          </div>
        </div>

        {!floorContext?.floorId ? (
          <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50 p-6 text-center text-sm text-amber-800">
            Floor information is missing. Please open Floor Management from
            Building Management and select a floor again.
          </div>
        ) : loading ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <Spin size="large" />
          </div>
        ) : zoneList.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            No zones on this floor yet.
            {canCreateZone ? " Click Create Zone to add the first zone." : null}
          </div>
        ) : (
          <div className="flex flex-col md:flex-row min-h-[400px] border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {/* Master List (Left) */}
            <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50 flex flex-col">
              <div className="p-4 border-b border-slate-200 bg-white font-semibold text-slate-700 flex items-center justify-between">
                <span>Zone List</span>
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{zoneList.length} total</span>
              </div>
              <div className="flex-1 overflow-y-auto max-h-[500px]">
                {zoneList.map((zone, index) => {
                  const isSelected = selectedMasterZoneId === zone.id;
                  const title = getZoneTitle(zone, index);
                  const zoneStatusStyle = getStatusStyle(zone.status);
                  return (
                    <div
                      key={zone.id}
                      onClick={() => setSelectedMasterZoneId(zone.id)}
                      className={`cursor-pointer px-5 py-4 border-b border-slate-100 transition-colors flex items-center justify-between ${
                        isSelected
                          ? "bg-indigo-50 border-l-4 border-l-indigo-600 pl-4"
                          : "bg-white hover:bg-slate-50 border-l-4 border-l-transparent pl-4"
                      }`}
                    >
                      <span
                        className={`font-medium ${
                          isSelected ? "text-indigo-700" : "text-slate-700"
                        }`}
                      >
                        {title}
                      </span>
                      <div className="flex items-center gap-2">
                        <Tag color={zoneStatusStyle.tagColor} className="m-0 text-[10px]">
                          {zoneStatusStyle.label}
                        </Tag>
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${zoneStatusStyle.dot}`}
                          title={zoneStatusStyle.label}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detail View (Right) */}
            <div className="w-full md:w-2/3 bg-white p-6 md:p-8 flex flex-col">
              {selectedMasterZone ? (
                <div className="animate-in fade-in duration-300 h-full flex flex-col">
                  {(() => {
                    const zoneStatusStyle = getStatusStyle(selectedMasterZone.status);
                    const currentZoneStatus = normalizeStatus(selectedMasterZone.status);
                    return (
                      <>
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800">
                        Zone name: {getZoneTitle(selectedMasterZone, zoneList.indexOf(selectedMasterZone))}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Select an action below or change the status.
                      </p>
                    </div>
                    <Tag color={zoneStatusStyle.tagColor} className="text-sm px-3 py-1">
                      {currentZoneStatus === "MAINTENANCE" && <Wrench size={12} className="mr-1 inline" />}
                      {zoneStatusStyle.label}
                    </Tag>
                  </div>

                  {/* Zone Status segmented buttons */}
                  <div className="mb-6 flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
                    {ZONE_STATUSES.map((st) => {
                      const isActive = currentZoneStatus === st;
                      const stStyle = getStatusStyle(st);
                      return (
                        <button
                          key={st}
                          type="button"
                          disabled={currentZoneStatus === "FULL" || isParentMaintenance}
                          onClick={() => handleToggleStatus(selectedMasterZone.id, st)}
                          className={`flex-1 rounded-md px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                            isActive
                              ? `${stStyle.bg} ${stStyle.border} border text-slate-800 shadow-sm`
                              : "border border-transparent text-slate-500 hover:bg-white hover:text-slate-700"
                          } ${currentZoneStatus === "FULL" || isParentMaintenance ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                        >
                          {stStyle.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                      <p className="text-sm text-slate-500 font-medium mb-1">
                        Max Capacity
                      </p>
                      <p className="text-3xl font-bold text-slate-700">
                        {selectedMasterZone.maxCapacity}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                      <p className="text-sm text-slate-500 font-medium mb-1">
                        Slot Count
                      </p>
                      <p className="text-3xl font-bold text-slate-700">
                        {selectedMasterZone.slotCount}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 mt-auto">
                    <Button
                      type="primary"
                      size="large"
                      onClick={() =>
                        handleSelectZone(
                          selectedMasterZone,
                          getZoneTitle(selectedMasterZone, zoneList.indexOf(selectedMasterZone))
                        )
                      }
                      className="flex-1 w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base font-medium"
                    >
                      Manage Slots →
                    </Button>
                    <Button
                      size="large"
                      icon={<Pencil size={16} />}
                      onClick={() => handleOpenEditModal(selectedMasterZone)}
                      className="flex-1 w-full h-12 text-base font-medium"
                    >
                      Edit Zone
                    </Button>
                  </div>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <Layers className="w-16 h-16 text-slate-200 mb-4" />
                  <p className="text-lg font-medium text-slate-500">
                    Select a zone to view details
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <CreateZoneModal
        open={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false);
          zoneForm.resetFields();
          dispatch(resetCreateZoneStatus());
        }}
        form={zoneForm}
        loading={createZoneLoading}
        onSubmit={handleCreateZone}
        floorName={floorName}
        floorMaxCapacity={floorMaxCapacity}
        usedCapacity={usedCapacity}
        remainingCapacity={remainingCapacity}
      />

      <EditZoneModal
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setSelectedEditZone(null);
          editForm.resetFields();
          dispatch(resetUpdateZoneStatus());
        }}
        form={editForm}
        loading={updateZoneLoading}
        onSubmit={handleUpdateZone}
        zone={selectedEditZone}
        floorName={floorName}
      />

      <ZoneSlotListModal
        open={isSlotModalOpen}
        onCancel={handleCloseSlotModal}
        zoneName={selectedZoneName}
        loading={slotsLoading}
        zoneId={selectedSlotZoneId}
        slots={slots}
        floorId={floorContext?.floorId}
        zoneStatus={
          selectedSlotZoneId
            ? zoneList.find((z) => z.id === selectedSlotZoneId)?.status
            : null
        }
        isParentMaintenance={isParentMaintenance}
      />
    </div>
  );
};

export default ZoneByFloorManagement;
