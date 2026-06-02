import { ArrowLeft, Layers } from "lucide-react";
import { Button, Form, Spin, Tag, message } from "antd";
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
import CreateZoneModal from "./modals/CreateZoneModal";
import ZoneSlotListModal from "./modals/ZoneSlotListModal";
import {
  FLOOR_CONTEXT_STORAGE_PREFIX,
  getRemainingFloorCapacity,
  mapSlotNames,
  pickZoneDisplayFields,
  sumZoneCapacities,
  ZONE_FLOOR_BANNER_IMAGE,
} from "../Building/utils/buildingUtils";

const readFloorContext = (floorSlug, locationState) => {
  if (locationState?.floorId) return locationState;

  try {
    const stored = sessionStorage.getItem(`${FLOOR_CONTEXT_STORAGE_PREFIX}${floorSlug}`);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const getZoneTitle = (zone, index) => {
  const displayFields = pickZoneDisplayFields(zone);
  return (
    zone.name ||
    displayFields.find((field) => field.key === "name")?.value ||
    `Zone ${index + 1}`
  );
};

const ZoneCard = ({ zone, index, onSelect }) => {
  const displayFields = pickZoneDisplayFields(zone);
  const title = getZoneTitle(zone, index);
  const statusField = displayFields.find((field) => field.key === "status");
  const detailFields = displayFields.filter(
    (field) => field.key !== "name" && field.key !== "status"
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(zone, title)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(zone, title);
        }
      }}
      className="cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-indigo-300 hover:shadow-md"
    >
      <img
        src={ZONE_FLOOR_BANNER_IMAGE}
        alt={title}
        className="h-44 w-full object-cover"
      />
      <div className="flex flex-col p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-slate-800">{title}</h3>
          {statusField ? (
            <Tag color={statusField.value === "ACTIVE" ? "green" : "gold"}>
              {statusField.value}
            </Tag>
          ) : null}
        </div>

        <div className="space-y-2 text-sm text-slate-600">
          {detailFields.length > 0 ? (
            detailFields.map((field) => (
              <p key={field.key}>
                <span className="font-semibold text-slate-700">{field.label}: </span>
                {field.value}
              </p>
            ))
          ) : (
            <p className="text-slate-500">No additional details.</p>
          )}
        </div>

        <p className="mt-3 text-xs font-medium text-indigo-600">View slots →</p>
      </div>
    </div>
  );
};

const ZoneByFloorManagement = () => {
  const dispatch = useDispatch();
  const { floorSlug } = useParams();
  const location = useLocation();
  const [zoneForm] = Form.useForm();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [selectedZoneName, setSelectedZoneName] = useState("");

  const floorContext = useMemo(
    () => readFloorContext(floorSlug, location.state),
    [floorSlug, location.state]
  );

  const { loading, getZoneByFloor: zones } = useSelector((state) => state.getZoneByFloor);
  const { loading: createZoneLoading, success: createZoneSuccess } = useSelector(
    (state) => state.createZone
  );
  const { loading: slotsLoading, getSlotByZone: slots } = useSelector(
    (state) => state.getSlotByZone
  );

  const zoneList = Array.isArray(zones) ? zones : [];
  const slotNames = mapSlotNames(slots);
  const floorName = floorContext?.floorName || floorSlug || "Floor";
  const buildingName = floorContext?.buildingName;
  const floorMaxCapacity = Number(floorContext?.maxCapacity);
  const usedCapacity = sumZoneCapacities(zoneList);
  const remainingCapacity = getRemainingFloorCapacity(floorMaxCapacity, zoneList);
  const canCreateZone =
    floorContext?.floorId &&
    Number.isFinite(floorMaxCapacity) &&
    floorMaxCapacity > 0 &&
    remainingCapacity > 0;

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
        `Total zone capacity cannot exceed floor capacity (${floorMaxCapacity}). Remaining: ${remainingCapacity}.`
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
      })
    );
  };

  const handleSelectZone = (zone, title) => {
    if (!zone?.id) return;
    setSelectedZoneName(title);
    setIsSlotModalOpen(true);
    dispatch(getSlotByZoneRequest(zone.id));
  };

  const handleCloseSlotModal = () => {
    setIsSlotModalOpen(false);
    setSelectedZoneName("");
    dispatch(clearGetSlotByZone());
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8">
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <CommonBreadcrumb role="Manager" page="building" subPage="floormanagement" />
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
                Capacity: {usedCapacity}/{floorMaxCapacity} used ({remainingCapacity} remaining)
              </p>
            )}
          </div>
          <Link to="/manager/building">
            <Button icon={<ArrowLeft size={16} />}>Back to Building</Button>
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Existing Zones</h2>
          <div className="flex items-center gap-2">
            <Button size="small" onClick={handleRefresh} disabled={!floorContext?.floorId}>
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
            Floor information is missing. Please open Floor Management from Building Management
            and select a floor again.
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {zoneList.map((zone, index) => (
              <ZoneCard
                key={zone.id || `zone-${index}`}
                zone={zone}
                index={index}
                onSelect={handleSelectZone}
              />
            ))}
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

      <ZoneSlotListModal
        open={isSlotModalOpen}
        onCancel={handleCloseSlotModal}
        zoneName={selectedZoneName}
        loading={slotsLoading}
        slotNames={slotNames}
      />
    </div>
  );
};

export default ZoneByFloorManagement;
