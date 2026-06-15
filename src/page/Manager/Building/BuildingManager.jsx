import { Building2, Eye, Pencil, Settings2 } from "lucide-react";

import { Button, Form, Spin, Switch, Tag } from "antd";

import { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import { useNavigate } from "react-router-dom";

import CommonBreadcrumb from "../../../components/Commandbreadcrumb/Commandbreadcrumb";

import {
  createBuildingRequest,
  resetCreateBuildingStatus,
} from "../../../redux/manager/Building/createBuilding/createBuildingSlice";

import { getBuildingListRequest } from "../../../redux/manager/Building/getBuildingList/getBuildingListSlice";

import {
  getBuildingDetailRequest,
  resetBuildingDetail,
} from "../../../redux/manager/Building/getBuildingDetail/getBuildingDetailSlice";

import {
  resetUpdateBuildingStatus,
  updateBuildingRequest,
} from "../../../redux/manager/Building/updateBuilding/updateBuildingSlice";

import CreateBuildingModal from "./modals/CreateBuildingModal";

import UpdateBuildingModal from "./modals/UpdateBuildingModal";

import BuildingDetailModal from "./modals/BuildingDetailModal";

import { updateBuildingStatusRequest } from "../../../redux/manager/Building/updateBuildingStatus/updateBuildingStatusSlice";
import {
  BUILDING_IMAGE,
  createTimeValue,
  isActiveStatus,
} from "./utils/buildingUtils";

export const BuildingManager = () => {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const [createForm] = Form.useForm();

  const [updateForm] = Form.useForm();

  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const [editingBuildingId, setEditingBuildingId] = useState(null);

  const { loading: createLoading, success } = useSelector(
    (state) => state.createBuilding,
  );

  const { loading: updateLoading, success: updateSuccess } = useSelector(
    (state) => state.updateBuilding,
  );

  const { buildings, loading: listLoading } = useSelector(
    (state) => state.getBuildingList,
  );

  const { buildingDetail, loading: detailLoading } = useSelector(
    (state) => state.getBuildingDetail,
  );
  const { updatingBuildingId } = useSelector(
    (state) => state.updateBuildingStatus,
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
    return () => {
      dispatch(resetCreateBuildingStatus());

      dispatch(resetBuildingDetail());

      dispatch(resetUpdateBuildingStatus());
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
      }),
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
      }),
    );
  };

  const handleOpenFloorManager = (building) => {
    navigate(`/manager/building/floors/${building.id}`, {
      state: { building },
    });
  };

  const handleOpenDetail = (buildingId) => {
    setIsDetailOpen(true);

    dispatch(getBuildingDetailRequest(buildingId));
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);

    dispatch(resetBuildingDetail());
  };

  const handleBuildingStatusChange = (buildingId, checked) => {
    dispatch(
      updateBuildingStatusRequest({
        buildingId,
        status: checked ? "ACTIVE" : "INACTIVE",
      }),
    );
  };

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
            <Button onClick={() => dispatch(getBuildingListRequest())}>
              Refresh
            </Button>

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

                    <div className="flex items-center gap-2">
                      <Switch
                        size="small"
                        checked={isActiveStatus(building.status)}
                        loading={updatingBuildingId === building.id}
                        checkedChildren="On"
                        unCheckedChildren="Off"
                        onChange={(checked) =>
                          handleBuildingStatusChange(building.id, checked)
                        }
                      />
                      <Tag
                        color={
                          isActiveStatus(building.status) ? "green" : "gold"
                        }
                      >
                        {building.status || "N/A"}
                      </Tag>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600">
                    <p>
                      <span className="font-semibold text-slate-700">
                        Address:{" "}
                      </span>

                      {building.address || "N/A"}
                    </p>

                    <p>
                      <span className="font-semibold text-slate-700">
                        Floors:{" "}
                      </span>

                      {building.totalFloors ?? "N/A"}
                    </p>

                    {/* <p>
                      <span className="font-semibold text-slate-700">
                        Occupancy:{" "}
                      </span>
                      {building.currentOccupancy ?? 0}/
                      {building.maxCapacity ?? 0}
                    </p>

                    <p>
                      <span className="font-semibold text-slate-700">
                        Slots:{" "}
                      </span>

                      {building.slotCount ?? 0}
                    </p> */}
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

export default BuildingManager;
