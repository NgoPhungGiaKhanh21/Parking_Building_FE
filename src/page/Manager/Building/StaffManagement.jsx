import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, Button, Form, Input, Select, Table, Tag } from "antd";
import { Eye, RefreshCw, Search, User, UserPlus, Users } from "lucide-react";
import CommonBreadcrumb from "../../../components/Commandbreadcrumb/Commandbreadcrumb";
import { getAllStaffRequest } from "../../../redux/manager/StaffManagement/GetAllStaff/getAllStaffSlice";
import {
  assignStaffRequest,
  resetAssignStaffStatus,
} from "../../../redux/manager/StaffManagement/AssignStaffToBuilding/assignStaffSlice";
import {
  getStaffBuildingsRequest,
  resetStaffBuildings,
} from "../../../redux/manager/StaffManagement/GetStaffBuildings/getStaffBuildingsSlice";
import {
  getBuildingStaffRequest,
  resetBuildingStaff,
} from "../../../redux/manager/StaffManagement/GetBuildingStaff/getBuildingStaffSlice";
import {
  removeStaffFromBuildingRequest,
  resetRemoveStaffFromBuildingStatus,
} from "../../../redux/manager/StaffManagement/RemoveStaffFromBuilding/removeStaffFromBuildingSlice";
import { getBuildingListRequest } from "../../../redux/manager/Building/getBuildingList/getBuildingListSlice";
import AssignStaffModal from "./modals/AssignStaffModal";
import StaffBuildingsModal from "./modals/StaffBuildingsModal";
import { getStaffBuildingLabel, getStaffId } from "./utils/staffUtils";

const StaffManagement = () => {
  const dispatch = useDispatch();
  const [assignForm] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [selectedBuildingId, setSelectedBuildingId] = useState(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isBuildingsOpen, setIsBuildingsOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const { staffs, loading, error } = useSelector((state) => state.getAllStaff);
  const { buildings } = useSelector((state) => state.getBuildingList);
  const { loading: assignLoading, success: assignSuccess } = useSelector(
    (state) => state.postStaffToBuilding
  );
  const { buildings: staffBuildings, loading: staffBuildingsLoading } =
    useSelector((state) => state.getStaffBuildings);
  const {
    staffs: buildingStaffs,
    loading: buildingStaffLoading,
    error: buildingStaffError,
  } = useSelector((state) => state.getBuildingStaff);
  const { loading: removeLoading, success: removeSuccess } = useSelector(
    (state) => state.removeStaffFromBuilding
  );

  const buildingList = Array.isArray(buildings) ? buildings : [];
  const isFiltering = selectedBuildingId != null;

  const refreshList = useCallback(() => {
    if (selectedBuildingId) {
      dispatch(getBuildingStaffRequest(selectedBuildingId));
    } else {
      dispatch(getAllStaffRequest());
    }
  }, [dispatch, selectedBuildingId]);

  useEffect(() => {
    dispatch(getAllStaffRequest());
    dispatch(getBuildingListRequest());
    return () => {
      dispatch(resetAssignStaffStatus());
      dispatch(resetStaffBuildings());
      dispatch(resetBuildingStaff());
      dispatch(resetRemoveStaffFromBuildingStatus());
    };
  }, [dispatch]);

  useEffect(() => {
    if (!assignSuccess) return;
    assignForm.resetFields();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsAssignOpen(false);
    dispatch(resetAssignStaffStatus());
    refreshList();
  }, [assignSuccess, assignForm, dispatch, refreshList]);

  useEffect(() => {
    if (!removeSuccess) return;
    dispatch(resetRemoveStaffFromBuildingStatus());
    if (selectedStaff) {
      dispatch(getStaffBuildingsRequest(getStaffId(selectedStaff)));
    }
    refreshList();
  }, [removeSuccess, dispatch, selectedStaff, refreshList]);

  const staffList = isFiltering
    ? Array.isArray(buildingStaffs)
      ? buildingStaffs
      : []
    : Array.isArray(staffs)
    ? staffs
    : [];

  const tableLoading = isFiltering ? buildingStaffLoading : loading;
  const listError = isFiltering ? buildingStaffError : error;

  const filteredList = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return staffList;
    return staffList.filter(
      (s) =>
        s.fullName?.toLowerCase().includes(keyword) ||
        s.email?.toLowerCase().includes(keyword) ||
        s.username?.toLowerCase().includes(keyword)
    );
  }, [staffList, searchText]);

  const activeCount = staffList.filter((s) => s.status === "ACTIVE").length;
  const filteredBuildingName = buildingList.find(
    (b) => b.id === selectedBuildingId
  )?.name;

  const handleFilterChange = (value) => {
    setSelectedBuildingId(value ?? null);
    if (value) dispatch(getBuildingStaffRequest(value));
    else {
      dispatch(resetBuildingStaff());
      dispatch(getAllStaffRequest());
    }
  };

  const openBuildingsModal = (staff) => {
    setSelectedStaff(staff);
    setIsBuildingsOpen(true);
    dispatch(getStaffBuildingsRequest(getStaffId(staff)));
  };

  const closeBuildingsModal = () => {
    setIsBuildingsOpen(false);
    setSelectedStaff(null);
    dispatch(resetStaffBuildings());
    dispatch(resetRemoveStaffFromBuildingStatus());
  };

  const columns = [
    {
      title: "Staff",
      key: "staff",
      fixed: "left",
      render: (_, r) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={r.avatarUrl}
            icon={!r.avatarUrl && <User size={18} />}
            size={42}
            className="shrink-0 border border-slate-100 bg-cyan-50 text-cyan-500"
          />
          <div>
            <p className="font-bold text-slate-800">{r.fullName || "N/A"}</p>
            {r.username && (
              <p className="text-xs text-slate-400">@{r.username}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (v) => v || "—",
    },
    {
      title: "Phone",
      dataIndex: "phoneNumber",
      key: "phone",
      render: (v) => v || "—",
    },
    {
      title: "Building",
      key: "building",
      render: (_, r) =>
        (isFiltering && filteredBuildingName) ||
        getStaffBuildingLabel(r) ||
        "—",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "ACTIVE" ? "green" : "red"}>
          {status || "N/A"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      fixed: "right",
      render: (_, r) => (
        <Button
          size="small"
          icon={<Eye size={14} />}
          onClick={() => openBuildingsModal(r)}
        >
          Buildings
        </Button>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8">
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <CommonBreadcrumb role="Manager" page="staff" />
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-100 bg-cyan-50 text-cyan-600">
              <Users size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Staff Management
              </h1>
              <p className="text-slate-500">
                View and manage staff in your buildings.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              icon={<RefreshCw size={16} />}
              loading={tableLoading}
              onClick={refreshList}
            >
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<UserPlus size={16} />}
              onClick={() => setIsAssignOpen(true)}
            >
              Assign Staff
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { label: "Total", value: staffList.length, color: "text-slate-800" },
          { label: "Active", value: activeCount, color: "text-green-700" },
          {
            label: "Inactive",
            value: staffList.length - activeCount,
            color: "text-red-700",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className={`mt-1 text-3xl font-bold ${item.color}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold text-slate-800">Staff List</h2>
          <div className="flex gap-2">
            <Select
              allowClear
              placeholder="Filter by building"
              className="min-w-[200px]"
              value={selectedBuildingId}
              onChange={handleFilterChange}
              options={buildingList.map((b) => ({
                value: b.id,
                label: b.name || `Building #${b.id}`,
              }))}
              showSearch
              optionFilterProp="label"
            />
            <Input
              placeholder="Search..."
              prefix={<Search size={16} className="text-slate-400" />}
              className="w-48"
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>

        {listError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {listError}
          </div>
        )}

        <Table
          columns={columns}
          dataSource={filteredList}
          rowKey={(r) => getStaffId(r) || r.email}
          loading={tableLoading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 900 }}
        />
      </div>

      <AssignStaffModal
        open={isAssignOpen}
        onCancel={() => {
          setIsAssignOpen(false);
          assignForm.resetFields();
          dispatch(resetAssignStaffStatus());
        }}
        form={assignForm}
        loading={assignLoading}
        buildings={buildingList}
        staffs={Array.isArray(staffs) ? staffs : []}
        onSubmit={(values) =>
          dispatch(
            assignStaffRequest({
              buildingId: values.buildingId,
              userId: values.userId,
            })
          )
        }
      />

      <StaffBuildingsModal
        open={isBuildingsOpen}
        onCancel={closeBuildingsModal}
        staff={selectedStaff}
        buildings={Array.isArray(staffBuildings) ? staffBuildings : []}
        loading={staffBuildingsLoading}
        removeLoading={removeLoading}
        onRemove={(payload) =>
          dispatch(removeStaffFromBuildingRequest(payload))
        }
      />
    </div>
  );
};

export default StaffManagement;
