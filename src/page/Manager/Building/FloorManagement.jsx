import { ArrowLeft, PenSquare, Settings2, CarFront, Wrench } from "lucide-react";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Spin,
  Tag,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import CommonBreadcrumb from "../../../components/Commandbreadcrumb/Commandbreadcrumb";
import { getBuildingDetailRequest } from "../../../redux/manager/Building/getBuildingDetail/getBuildingDetailSlice";
import {
  getBuildingFloorsRequest,
  resetBuildingFloors,
} from "../../../redux/manager/Building/getBuildingFloors/getBuildingFloorsSlice";
import {
  createFloorRequest,
  resetCreateFloorStatus,
} from "../../../redux/manager/Building/createFloor/createFloorSlice";
import { getVehicleTypeListRequest } from "../../../redux/manager/Building/getVehicleTypeList/getVehicleTypeListSlice";
import {
  resetUpdateFloorStatus,
  updateFloorRequest,
} from "../../../redux/manager/Building/updateFloor/updateFloorSlice";
import { updateFloorStatusRequest } from "../../../redux/manager/Building/updateFloorStatus/updateFloorStatusSlice";
import UpdateFloorModal from "./modals/UpdateFloorModal";
import {
  floorNameToSlug,
  FLOOR_CONTEXT_STORAGE_PREFIX,
  isActiveStatus,
  getStatusStyle,
  normalizeStatus,
  mapVehicleTypeOptions,
} from "./utils/buildingUtils";

const FLOOR_STATUSES = ["ACTIVE", "INACTIVE", "MAINTENANCE"];

const FloorCard = ({
  floor,
  onSelect,
  onEdit,
  onStatusChange,
  statusLoading,
  parentMaintenance,
}) => {
  const name = floor.name || floor.floorName || "N/A";
  const level = floor.level ?? floor.floorLevel ?? "N/A";
  const vehicleType = floor.vehicleTypeName || floor.vehicleType || "N/A";
  const capacity = floor.maxCapacity ?? 0;
  const statusStyle = getStatusStyle(floor.status);
  const currentStatus = normalizeStatus(floor.status);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(floor)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(floor);
        }
      }}
      className={`group flex min-h-[200px] h-full cursor-pointer flex-col rounded-2xl border-2 ${statusStyle.border} bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md`}
    >
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-slate-800 transition-colors group-hover:text-indigo-600">
            {name}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-500">
            <CarFront size={14} className="text-slate-400" />
            {vehicleType}
          </p>
        </div>
        <div
          className="flex flex-col items-end gap-1"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <Tag color={statusStyle.tagColor}>
            {currentStatus === "MAINTENANCE" && <Wrench size={10} className="mr-1 inline" />}
            {statusStyle.label}
          </Tag>
          <Tag color="blue" className="m-0">
            Level {level}
          </Tag>
        </div>
      </div>

      {/* Status segmented buttons */}
      <div
        className="mb-3 flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        {FLOOR_STATUSES.map((st) => {
          const isActive = currentStatus === st;
          const stStyle = getStatusStyle(st);
          return (
            <button
              key={st}
              type="button"
              disabled={statusLoading || parentMaintenance}
              onClick={() => onStatusChange(floor.id, st)}
              className={`flex-1 rounded-md px-2 py-1.5 text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? `${stStyle.bg} ${stStyle.border} border text-slate-800 shadow-sm`
                  : "border border-transparent text-slate-500 hover:bg-white hover:text-slate-700"
              } ${statusLoading || parentMaintenance ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              {stStyle.label}
            </button>
          );
        })}
      </div>

      <div className="mt-2 space-y-3">
        <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
          <span className="text-sm font-medium text-slate-500">
            Max Capacity
          </span>
          <span className="text-base font-bold text-slate-700">
            {capacity} slots
          </span>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between pt-5">
        <span className="text-sm font-semibold text-indigo-600 transition-colors group-hover:text-indigo-700">
          View zones →
        </span>
        <Button
          size="middle"
          type="default"
          className="rounded-lg border-slate-200 text-slate-600 hover:border-indigo-600 hover:text-indigo-600"
          icon={<PenSquare size={16} />}
          onClick={(event) => {
            event.stopPropagation();
            onEdit(floor);
          }}
        >
          Edit
        </Button>
      </div>
    </div>
  );
};

const FloorManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { buildingId } = useParams();
  const location = useLocation();
  const [floorForm] = Form.useForm();
  const [updateFloorForm] = Form.useForm();
  const [isUpdateFloorModalOpen, setIsUpdateFloorModalOpen] = useState(false);
  const [editingFloor, setEditingFloor] = useState(null);

  const buildingFromState = location.state?.building;
  const { buildingDetail } = useSelector((state) => state.getBuildingDetail);
  const { loading: createFloorLoading, success: createFloorSuccess } =
    useSelector((state) => state.createFloor);
  const { loading: updateFloorLoading, success: updateFloorSuccess } =
    useSelector((state) => state.updateFloor);
  const { floors, loading: floorsLoading } = useSelector(
    (state) => state.getBuildingFloors
  );
  const { vehicleTypes, loading: vehicleTypesLoading } = useSelector(
    (state) => state.getVehicleTypeList
  );
  const { updatingFloorId } = useSelector((state) => state.updateFloorStatus);

  const building = buildingFromState || buildingDetail;
  const buildingName = building?.name || "Building";
  const floorList = useMemo(
    () => (Array.isArray(floors) ? floors : []),
    [floors]
  );

  useEffect(() => {
    if (!buildingId) return;
    dispatch(getVehicleTypeListRequest());
    dispatch(getBuildingFloorsRequest(buildingId));
    if (!buildingFromState?.name) {
      dispatch(getBuildingDetailRequest(buildingId));
    }
  }, [dispatch, buildingId, buildingFromState?.name]);

  useEffect(() => {
    if (createFloorSuccess && buildingId) {
      floorForm.resetFields();
      dispatch(resetCreateFloorStatus());
      dispatch(getBuildingFloorsRequest(buildingId));
    }
  }, [createFloorSuccess, buildingId, dispatch, floorForm]);

  useEffect(() => {
    if (updateFloorSuccess && buildingId) {
      updateFloorForm.resetFields();
      setTimeout(() => {
        setIsUpdateFloorModalOpen(false);
        setEditingFloor(null);
      }, 0);
      dispatch(resetUpdateFloorStatus());
      dispatch(getBuildingFloorsRequest(buildingId));
    }
  }, [updateFloorSuccess, buildingId, dispatch, updateFloorForm]);

  useEffect(() => {
    return () => {
      dispatch(resetCreateFloorStatus());
      dispatch(resetUpdateFloorStatus());
      dispatch(resetBuildingFloors());
    };
  }, [dispatch]);

  const handleCreateFloor = (values) => {
    if (!buildingId) return;
    dispatch(
      createFloorRequest({
        buildingId,
        data: {
          floorName: values.floorName?.trim(),
          vehicleTypeId: values.vehicleTypeId,
          floorLevel: values.floorLevel,
          maxCapacity: values.maxCapacity,
        },
      })
    );
  };

  const handleOpenUpdateFloorModal = (floor) => {
    setEditingFloor(floor);
    setIsUpdateFloorModalOpen(true);
    updateFloorForm.setFieldsValue({
      floorName: floor?.name || floor?.floorName || "",
      vehicleTypeId:
        floor?.vehicleTypeId ??
        floor?.floorVehicleTypeId ??
        floor?.vehicleType?.vehicleTypeId ??
        null,
      maxCapacity: floor?.maxCapacity ?? null,
    });
  };

  const handleCloseUpdateFloorModal = () => {
    setIsUpdateFloorModalOpen(false);
    setEditingFloor(null);
    updateFloorForm.resetFields();
    dispatch(resetUpdateFloorStatus());
  };

  const handleUpdateFloor = (values) => {
    const floorId = editingFloor?.id;
    if (!floorId) return;
    dispatch(
      updateFloorRequest({
        floorId,
        data: {
          floorName: values.floorName?.trim(),
          vehicleTypeId: values.vehicleTypeId,
          maxCapacity: values.maxCapacity,
        },
      })
    );
  };

  const handleFloorStatusChange = (floorId, newStatus) => {
    dispatch(
      updateFloorStatusRequest({
        floorId,
        buildingId,
        status: newStatus,
      })
    );
  };

  const handleSelectFloor = (floor) => {
    const floorName = floor?.name || floor?.floorName;
    const slug = floorNameToSlug(floorName);
    if (!slug || !floor?.id) return;

    const floorContext = {
      floorId: floor.id,
      floorName,
      buildingName,
      buildingStatus: building?.status,
      floorStatus: floor.status,
      maxCapacity: floor.maxCapacity ?? null,
    };

    sessionStorage.setItem(
      `${FLOOR_CONTEXT_STORAGE_PREFIX}${floor.id}`,
      JSON.stringify(floorContext)
    );
    navigate(`/manager/building/floors/${floor.id}/${slug}`, { state: floorContext });
  };

  const vehicleTypeOptions = mapVehicleTypeOptions(vehicleTypes);

  return (
    // Đổi background thành màu slate nhạt hơn để bật khối nội dung trắng lên
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      <div className="mb-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-6">
          <CommonBreadcrumb
            role="Manager"
            page="building"
            subPage="floormanagement"
          />
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50/50 text-indigo-600 shadow-inner">
              <Settings2 size={32} strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 md:text-3xl">
                Floor Management
                <span className="ml-2 text-slate-400 font-normal">
                  | {buildingName}
                </span>
              </h1>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Organize and manage floors, zones, and capacities for this
                building.
              </p>
            </div>
          </div>
          <Link to="/manager/building" className="self-start sm:self-auto">
            <Button
              size="large"
              className="rounded-xl border-slate-200 hover:border-slate-300"
              icon={<ArrowLeft size={16} />}
            >
              Back to Building
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm xl:col-span-1">
          <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="h-8 w-2 rounded-full bg-blue-600" />
            <h2 className="text-xl font-bold tracking-tight text-slate-800">
              Create Floor
            </h2>
          </div>

          <Form
            form={floorForm}
            layout="vertical"
            requiredMark={false}
            onFinish={handleCreateFloor}
            size="large"
          >
            <Form.Item
              name="floorName"
              label={
                <span className="font-medium text-slate-700">Floor Name</span>
              }
              rules={[{ required: true, message: "Please enter floor name." }]}
            >
              <Input
                placeholder="e.g. Basement 1, Tầng xe máy..."
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              name="vehicleTypeId"
              label={
                <span className="font-medium text-slate-700">Vehicle Type</span>
              }
              rules={[
                { required: true, message: "Please select vehicle type." },
              ]}
            >
              <Select
                loading={vehicleTypesLoading}
                placeholder="Select vehicle type"
                options={vehicleTypeOptions}
                className="rounded-lg"
                notFoundContent={
                  vehicleTypesLoading ? <Spin size="small" /> : "No data"
                }
              />
            </Form.Item>

            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
              <Form.Item
                name="floorLevel"
                label={
                  <span className="font-medium text-slate-700">
                    Floor Level
                  </span>
                }
                rules={[{ required: true, message: "Required." }]}
              >
                <InputNumber
                  min={1}
                  precision={0}
                  className="w-full rounded-lg"
                  placeholder="e.g. 1"
                />
              </Form.Item>
              <Form.Item
                name="maxCapacity"
                label={
                  <span className="font-medium text-slate-700">
                    Max Capacity
                  </span>
                }
                rules={[{ required: true, message: "Required." }]}
              >
                <InputNumber
                  min={1}
                  precision={0}
                  className="w-full rounded-lg"
                  placeholder="e.g. 50"
                />
              </Form.Item>
            </div>

            <Button
              htmlType="submit"
              type="primary"
              loading={createFloorLoading}
              className="mt-2 h-12 w-full rounded-xl text-base font-semibold shadow-md hover:shadow-lg"
            >
              Create Floor
            </Button>
          </Form>
        </div>

        {/* Cột Phải - Existing Floors */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="mb-6 flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-2 rounded-full bg-indigo-600" />
              <h2 className="text-xl font-bold tracking-tight text-slate-800">
                Existing Floors
              </h2>
            </div>
            <Button
              onClick={() =>
                buildingId && dispatch(getBuildingFloorsRequest(buildingId))
              }
              loading={floorsLoading}
              className="rounded-lg border-slate-200"
            >
              Refresh Floors
            </Button>
          </div>

          {floorsLoading ? (
            <div className="flex min-h-[300px] items-center justify-center rounded-xl bg-slate-50/50">
              <Spin size="large" />
            </div>
          ) : floorList.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center transition-colors hover:border-slate-300 hover:bg-slate-100/50">
              <div className="mb-4 rounded-full bg-slate-200 p-4 text-slate-400">
                <CarFront size={32} />
              </div>
              <h3 className="text-lg font-semibold text-slate-700">
                No floors found
              </h3>
              <p className="mt-1 text-sm text-slate-500 max-w-sm">
                Get started by creating your first floor using the form on the
                left.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 ">
              {floorList.map((floor) => (
                <FloorCard
                  key={floor.id}
                  floor={floor}
                  onSelect={handleSelectFloor}
                  onEdit={handleOpenUpdateFloorModal}
                  onStatusChange={handleFloorStatusChange}
                  statusLoading={updatingFloorId === floor.id}
                  parentMaintenance={normalizeStatus(building?.status) === "MAINTENANCE"}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <UpdateFloorModal
        open={isUpdateFloorModalOpen}
        onCancel={handleCloseUpdateFloorModal}
        form={updateFloorForm}
        loading={updateFloorLoading}
        onSubmit={handleUpdateFloor}
        vehicleTypeOptions={vehicleTypeOptions}
        vehicleTypesLoading={vehicleTypesLoading}
      />
    </div>
  );
};

export default FloorManagement;
