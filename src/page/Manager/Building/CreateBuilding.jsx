import { Building2, Eye, Pencil, Settings2 } from "lucide-react";
import { Button, Form, Spin, Tag } from "antd";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import CommonBreadcrumb from "../../../components/Commandbreadcrumb/Commandbreadcrumb";
import {
  createBuildingRequest,
  resetCreateBuildingStatus,
} from "../../../redux/manager/Building/createBuildingSlice";
import { getBuildingListRequest } from "../../../redux/manager/Building/getBuildingListSlice";
import {
  getBuildingDetailRequest,
  resetBuildingDetail,
} from "../../../redux/manager/Building/getBuildingDetailSlice";
import {
  resetUpdateBuildingStatus,
  updateBuildingRequest,
} from "../../../redux/manager/Building/updateBuildingSlice";
import {
  getBuildingFloorsRequest,
  resetBuildingFloors,
} from "../../../redux/manager/Building/getBuildingFloorsSlice";
import {
  createFloorRequest,
  resetCreateFloorStatus,
} from "../../../redux/manager/Building/createFloorSlice";
import { getVehicleTypeListRequest } from "../../../redux/manager/Building/getVehicleTypeListSlice";
import {
  resetUpdateFloorStatus,
  updateFloorRequest,
} from "../../../redux/manager/Building/updateFloorSlice";
import CreateBuildingModal from "./modals/CreateBuildingModal";
import UpdateBuildingModal from "./modals/UpdateBuildingModal";
import FloorManagementModal from "./modals/FloorManagementModal";
import UpdateFloorModal from "./modals/UpdateFloorModal";
import BuildingDetailModal from "./modals/BuildingDetailModal";
import {
  BUILDING_IMAGE,
  createTimeValue,
  mapVehicleTypeOptions,
  floorNameToSlug,
  FLOOR_CONTEXT_STORAGE_PREFIX,
} from "./utils/buildingUtils";

const CreateBuilding = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [createForm] = Form.useForm();
  const [updateForm] = Form.useForm();
  const [floorForm] = Form.useForm();
  const [updateFloorForm] = Form.useForm();
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isFloorModalOpen, setIsFloorModalOpen] = useState(false);
  const [isUpdateFloorModalOpen, setIsUpdateFloorModalOpen] = useState(false);
  const [editingBuildingId, setEditingBuildingId] = useState(null);
  const [floorBuilding, setFloorBuilding] = useState(null);
  const [editingFloor, setEditingFloor] = useState(null);

  const { loading: createLoading, success } = useSelector(
    (state) => state.createBuilding
  );
  const { loading: updateLoading, success: updateSuccess } = useSelector(
    (state) => state.updateBuilding
  );
  const { loading: createFloorLoading, success: createFloorSuccess } = useSelector(
    (state) => state.createFloor
  );
  const { loading: updateFloorLoading, success: updateFloorSuccess } = useSelector(
    (state) => state.updateFloor
  );
  const { buildings, loading: listLoading } = useSelector(
    (state) => state.getBuildingList
  );
  const { buildingDetail, loading: detailLoading } = useSelector(
    (state) => state.getBuildingDetail
  );
  const { floors, loading: floorsLoading } = useSelector(
    (state) => state.getBuildingFloors
  );
  const { vehicleTypes, loading: vehicleTypesLoading } = useSelector(
    (state) => state.getVehicleTypeList
  );

  useEffect(() => {
    dispatch(getBuildingListRequest());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      createForm.resetFields();
      dispatch(resetCreateBuildingStatus());
      dispatch(getBuildingListRequest());
      setTimeout(() => setIsCreateModalOpen(false), 0);
    }
  }, [success, dispatch, createForm]);

  useEffect(() => {
    if (updateSuccess) {
      updateForm.resetFields();
      setTimeout(() => {
        setIsUpdateModalOpen(false);
        setEditingBuildingId(null);
      }, 0);
      dispatch(resetUpdateBuildingStatus());
      dispatch(getBuildingListRequest());
    }
  }, [updateSuccess, dispatch, updateForm]);

  useEffect(() => {
    if (createFloorSuccess && floorBuilding?.id) {
      floorForm.resetFields();
      dispatch(resetCreateFloorStatus());
      dispatch(getBuildingFloorsRequest(floorBuilding.id));
    }
  }, [createFloorSuccess, floorBuilding, dispatch, floorForm]);

  useEffect(() => {
    if (updateFloorSuccess && floorBuilding?.id) {
      updateFloorForm.resetFields();
      setTimeout(() => {
        setIsUpdateFloorModalOpen(false);
        setEditingFloor(null);
      }, 0);
      dispatch(resetUpdateFloorStatus());
      dispatch(getBuildingFloorsRequest(floorBuilding.id));
    }
  }, [updateFloorSuccess, floorBuilding, dispatch, updateFloorForm]);

  useEffect(() => {
    return () => {
      dispatch(resetCreateBuildingStatus());
      dispatch(resetBuildingDetail());
      dispatch(resetUpdateBuildingStatus());
      dispatch(resetCreateFloorStatus());
      dispatch(resetUpdateFloorStatus());
      dispatch(resetBuildingFloors());
    };
  }, [dispatch]);

  const handleSubmit = (values) => {
    dispatch(
      createBuildingRequest({
        buildingName: values.buildingName?.trim(),
        address: values.address?.trim(),
        totalFloors: values.totalFloors,
        operatingStartTime: values.operatingStartTime?.format("HH:mm:ss"),
        operatingEndTime: values.operatingEndTime?.format("HH:mm:ss"),
        contactNumber: values.contactNumber?.trim(),
      })
    );
  };

  const handleOpenUpdate = (building) => {
    setEditingBuildingId(building.id);
    setIsUpdateModalOpen(true);
    updateForm.setFieldsValue({
      buildingName: building.name || "",
      address: building.address || "",
      totalFloors: building.totalFloors ?? null,
      operatingStartTime: createTimeValue(building.operatingStartTime),
      operatingEndTime: createTimeValue(building.operatingEndTime),
      contactNumber: building.contactNumber || "",
    });
  };

  const handleUpdateSubmit = (values) => {
    if (!editingBuildingId) return;
    dispatch(
      updateBuildingRequest({
        buildingId: editingBuildingId,
        data: {
          buildingName: values.buildingName?.trim(),
          address: values.address?.trim(),
          totalFloors: values.totalFloors,
          operatingStartTime: values.operatingStartTime?.format("HH:mm:ss"),
          operatingEndTime: values.operatingEndTime?.format("HH:mm:ss"),
          contactNumber: values.contactNumber?.trim(),
        },
      })
    );
  };

  const handleOpenFloorManager = (building) => {
    setFloorBuilding(building);
    setIsFloorModalOpen(true);
    dispatch(getVehicleTypeListRequest());
    dispatch(getBuildingFloorsRequest(building.id));
  };

  const handleCloseFloorManager = () => {
    setIsFloorModalOpen(false);
    setFloorBuilding(null);
    floorForm.resetFields();
    dispatch(resetCreateFloorStatus());
    dispatch(resetBuildingFloors());
  };

  const handleSelectFloor = (floor) => {
    const floorName = floor?.name || floor?.floorName;
    const slug = floorNameToSlug(floorName);
    if (!slug || !floor?.id) return;

    const floorContext = {
      floorId: floor.id,
      floorName,
      buildingId: floorBuilding?.id,
      buildingName: floorBuilding?.name,
      maxCapacity: floor.maxCapacity ?? null,
    };

    sessionStorage.setItem(
      `${FLOOR_CONTEXT_STORAGE_PREFIX}${slug}`,
      JSON.stringify(floorContext)
    );
    setIsFloorModalOpen(false);
    navigate(`/manager/building/${slug}`, { state: floorContext });
  };

  const handleCreateFloor = (values) => {
    if (!floorBuilding?.id) return;
    dispatch(
      createFloorRequest({
        buildingId: floorBuilding.id,
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
          maxCapacity: values.maxCapacity,
        },
      })
    );
  };

  const handleOpenDetail = (buildingId) => {
    setIsDetailOpen(true);
    dispatch(getBuildingDetailRequest(buildingId));
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    dispatch(resetBuildingDetail());
  };

  const vehicleTypeOptions = mapVehicleTypeOptions(vehicleTypes);

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8">
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <CommonBreadcrumb role={"Manager"} page={"building"} />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600">
            <Building2 size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">
              Create Building
            </h1>
            <p className="mt-1 font-medium text-slate-500">
              Add basic information to set up a new parking building.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Building List</h2>
          <div className="flex items-center gap-2">
            <Button onClick={() => dispatch(getBuildingListRequest())}>Refresh</Button>
            <Button type="primary" onClick={() => setIsCreateModalOpen(true)}>
              Create Building
            </Button>
          </div>
        </div>

        {listLoading ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <Spin size="large" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(Array.isArray(buildings) ? buildings : []).map((building) => (
              <div
                key={building.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <img
                  src={BUILDING_IMAGE}
                  alt="Building"
                  className="h-44 w-full object-cover"
                />
                <div className="flex min-h-[220px] flex-col p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <h3 className="text-base font-semibold text-slate-800">
                      {building.name || "N/A"}
                    </h3>
                    <Tag color={building.status === "ACTIVE" ? "green" : "gold"}>
                      {building.status || "N/A"}
                    </Tag>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600">
                    <p>
                      <span className="font-semibold text-slate-700">Address: </span>
                      {building.address || "N/A"}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-700">Floors: </span>
                      {building.totalFloors ?? "N/A"}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-700">Occupancy: </span>
                      {building.currentOccupancy ?? 0}/{building.maxCapacity ?? 0}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-700">Slots: </span>
                      {building.slotCount ?? 0}
                    </p>
                  </div>

                  <div className="mt-auto pt-4">
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        type="default"
                        icon={<Settings2 size={15} />}
                        onClick={() => handleOpenFloorManager(building)}
                        className="w-full"
                      >
                        Floors
                      </Button>
                      <Button
                        type="default"
                        icon={<Pencil size={15} />}
                        onClick={() => handleOpenUpdate(building)}
                        className="w-full"
                      >
                        Edit
                      </Button>
                      <Button
                        type="primary"
                        icon={<Eye size={15} />}
                        onClick={() => handleOpenDetail(building.id)}
                        className="w-full"
                      >
                        Detail
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateBuildingModal
        open={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false);
          createForm.resetFields();
          dispatch(resetCreateBuildingStatus());
        }}
        form={createForm}
        loading={createLoading}
        onSubmit={handleSubmit}
      />

      <UpdateBuildingModal
        open={isUpdateModalOpen}
        onCancel={() => {
          setIsUpdateModalOpen(false);
          setEditingBuildingId(null);
          updateForm.resetFields();
          dispatch(resetUpdateBuildingStatus());
        }}
        form={updateForm}
        loading={updateLoading}
        onSubmit={handleUpdateSubmit}
      />

      <FloorManagementModal
        open={isFloorModalOpen}
        onCancel={handleCloseFloorManager}
        floorBuilding={floorBuilding}
        floorForm={floorForm}
        createFloorLoading={createFloorLoading}
        onCreateFloor={handleCreateFloor}
        vehicleTypeOptions={vehicleTypeOptions}
        vehicleTypesLoading={vehicleTypesLoading}
        floors={floors}
        floorsLoading={floorsLoading}
        onRefresh={() =>
          floorBuilding?.id && dispatch(getBuildingFloorsRequest(floorBuilding.id))
        }
        onEditFloor={handleOpenUpdateFloorModal}
        onSelectFloor={handleSelectFloor}
      />

      <UpdateFloorModal
        open={isUpdateFloorModalOpen}
        onCancel={handleCloseUpdateFloorModal}
        form={updateFloorForm}
        loading={updateFloorLoading}
        onSubmit={handleUpdateFloor}
      />

      <BuildingDetailModal
        open={isDetailOpen}
        onCancel={handleCloseDetail}
        loading={detailLoading}
        buildingDetail={buildingDetail}
        buildingImage={BUILDING_IMAGE}
      />
    </div>
  );
};

export default CreateBuilding;
