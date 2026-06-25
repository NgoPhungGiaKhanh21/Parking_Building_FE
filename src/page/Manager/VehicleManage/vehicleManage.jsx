import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Select,
  Table,
  Card,
  Tag,
  Empty,
  Button,
  Popconfirm,
  Tabs,
  Modal,
  Form,
  Input,
  Tooltip,
  Badge,
  DatePicker,
  Row,
  Col,
  Image,
  Switch,
} from "antd";
import dayjs from "dayjs";
import {
  CarFront,
  UserSearch,
  RefreshCw,
  List,
  Plus,
  Edit,
  Trash2,
  LayoutGrid,
  Search,
  Filter,
} from "lucide-react";

// --- Import actions cho Vehicle (Tab 1) ---
import { changeStatusVehicleRequest } from "../../../redux/manager/Vehicle/changeStatusVehicle/changeStatusVehicleSlice";

// --- Import actions cho Vehicle Types (Tab 2) ---
import { createVehicleTypeRequest } from "../../../redux/manager/Vehicle/createVehicleType/createVehicleTypeSlice";

// THÊM: Import action delete (Hãy điều chỉnh lại đường dẫn cho đúng với project của bạn)
import { deleteVehicleTypeRequest } from "../../../redux/manager/Vehicle/deleteVehicleType/deleteVehicleTypeSlice";

// Import Modal Update
import UpdateVehicleTypeModal from "./updateVehicleTypeModal";
import CommonBreadcrumb from "../../../components/Commandbreadcrumb/Commandbreadcrumb";
import { getVehicleTypeListRequest } from "../../../redux/manager/Building/getVehicleTypeList/getVehicleTypeListSlice";
import { getAllVehicleRequest } from "../../../redux/manager/Vehicle/getAllVehicle/getAllVehicleSlice";

const VehicleManagement = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [filterForm] = Form.useForm();

  const [activeTab, setActiveTab] = useState("1");

  const handleSearch = (values) => {
    const formattedValues = {
      ...values,
      checkInFrom: values.checkInFrom
        ? values.checkInFrom.format("YYYY-MM-DDTHH:mm:ss")
        : undefined,
      checkInTo: values.checkInTo
        ? values.checkInTo.format("YYYY-MM-DDTHH:mm:ss")
        : undefined,
    };

    // Clean up undefined/null values
    const cleanValues = Object.fromEntries(
      Object.entries(formattedValues).filter(
        ([_, v]) => v !== undefined && v !== "" && v !== null,
      ),
    );

    console.log("Filter payload:", cleanValues);
    dispatch(getAllVehicleRequest(cleanValues));
  };

  const handleResetFilter = () => {
    filterForm.resetFields();
    dispatch(getAllVehicleRequest());
  };

  const applyPreset = (preset) => {
    const now = dayjs();
    let nextFrom;
    const nextTo = now;

    if (preset === "TODAY") {
      nextFrom = now.startOf("day");
    } else if (preset === "7D") {
      nextFrom = now.subtract(6, "day").startOf("day");
    } else if (preset === "30D") {
      nextFrom = now.subtract(29, "day").startOf("day");
    } else if (preset === "MONTH") {
      nextFrom = now.startOf("month");
    } else {
      return;
    }

    const currentValues = filterForm.getFieldsValue();
    const formattedValues = {
      ...currentValues,
      checkInFrom: nextFrom.format("YYYY-MM-DDTHH:mm:ss"),
      checkInTo: nextTo.format("YYYY-MM-DDTHH:mm:ss"),
    };

    filterForm.setFieldsValue({
      ...currentValues,
      checkInFrom: nextFrom,
      checkInTo: nextTo,
    });

    const cleanValues = Object.fromEntries(
      Object.entries(formattedValues).filter(
        ([_, v]) => v !== undefined && v !== "" && v !== null,
      ),
    );

    dispatch(getAllVehicleRequest(cleanValues));
  };

  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [selectedTypeData, setSelectedTypeData] = useState(null);

  // --- REDUX STATE ---
  const { getAllVehicleManager: vehiclesList, loading: isVehiclesLoading } =
    useSelector((state) => state.getAllVehicleManager);
  const { loading: isChangingStatus } = useSelector(
    (state) => state.changeStatusVehicle,
  );
  const { vehicleTypes, loading: isVehicleTypesLoading } = useSelector(
    (state) => state.getVehicleTypeList,
  );
  const { loading: isCreatingVehicleType } = useSelector(
    (state) => state.createVehicleType || {},
  );

  // Lấy state loading của Delete để làm hiệu ứng loading trên bảng
  const { loading: isDeletingVehicleType } = useSelector(
    (state) => state.deleteVehicleType || {},
  );

  // --- EFFECTS ---
  useEffect(() => {
    dispatch(getAllVehicleRequest());
    dispatch(getVehicleTypeListRequest());
  }, [dispatch]);

  // --- HANDLERS (TAB 1) ---
  const handleToggleStatus = (vehicleId, currentStatus, userId) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    dispatch(
      changeStatusVehicleRequest({
        vehicleId: vehicleId,
        status: newStatus,
        userId: userId,
      }),
    );
  };

  // --- HANDLERS (TAB 2) ---
  const handleOpenCreateModal = () => {
    form.resetFields();
    setIsCreateModalVisible(true);
  };

  const handleCancelCreate = () => {
    setIsCreateModalVisible(false);
  };

  const handleCreateSubmit = (values) => {
    dispatch(createVehicleTypeRequest(values));
    setIsCreateModalVisible(false);
    form.resetFields();
    setTimeout(() => {
      dispatch(getVehicleTypeListRequest());
    }, 500);
  };

  const handleOpenUpdateModal = (record) => {
    setSelectedTypeData(record);
    setIsUpdateModalVisible(true);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalVisible(false);
    setSelectedTypeData(null);
  };

  // HÀM XỬ LÝ DELETE ĐÃ ĐƯỢC CẬP NHẬT
  const handleDeleteType = (vehicleTypeId) => {
    dispatch(deleteVehicleTypeRequest({ vehicleTypeId: vehicleTypeId }));

    setTimeout(() => {
      dispatch(getVehicleTypeListRequest());
    }, 500);
  };

  // --- THỐNG KÊ DATA CHO TAB 2 ---
  const totalTypes = vehicleTypes?.length || 0;
  const smallTypesCount =
    vehicleTypes?.filter((t) => t.sizeCategory === "SMALL").length || 0;
  const mediumTypesCount =
    vehicleTypes?.filter((t) => t.sizeCategory === "MEDIUM").length || 0;
  const largeTypesCount =
    vehicleTypes?.filter((t) => t.sizeCategory === "LARGE").length || 0;

  // --- COLUMNS T1 ---
  const vehicleColumns = [
    {
      title: "Owner",
      dataIndex: "username",
      key: "username",
      sorter: (a, b) => {
        const nameA = a.username || "";
        const nameB = b.username || "";
        return nameA.localeCompare(nameB);
      },
      defaultSortOrder: "ascend",
      render: (text) => (
        <span className="font-semibold text-slate-800">@{text}</span>
      ),
    },
    {
      title: "Plate Number",
      dataIndex: "plateNumber",
      key: "plateNumber",
      sorter: (a, b) => (a.plateNumber || "").localeCompare(b.plateNumber || ""),
      render: (text) => (
        <span className="font-bold text-slate-700">{text}</span>
      ),
    },
    {
      title: "Brand & Model",
      key: "brandModel",
      sorter: (a, b) => (a.brand || "").localeCompare(b.brand || ""),
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-800">{record.brand}</span>
          <span className="text-xs text-slate-500">{record.model}</span>
        </div>
      ),
    },
    {
      title: "Vehicle Type",
      dataIndex: "vehicleTypeName",
      key: "vehicleTypeName",
      sorter: (a, b) => (a.vehicleTypeName || "").localeCompare(b.vehicleTypeName || ""),
      render: (type, record) => (
        <div className="flex flex-col gap-1">
          <span className="font-medium text-slate-700">{type}</span>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <div
              className="w-3 h-3 rounded-full border border-gray-300 shadow-sm"
              style={{
                backgroundColor: record.vehicleColor?.toLowerCase() || "#ccc",
              }}
            ></div>
            <span className="capitalize">{record.vehicleColor}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Parked Status",
      key: "parked",
      sorter: (a, b) => {
        const isParkedA = a.checkInTime && !a.checkOutTime ? 1 : 0;
        const isParkedB = b.checkInTime && !b.checkOutTime ? 1 : 0;
        return isParkedA - isParkedB;
      },
      render: (_, record) => {
        if (record.checkInTime && !record.checkOutTime) {
          return <Tag color="blue">Parked</Tag>;
        }
        return <Tag color="default">Not Parked</Tag>;
      },
    },
    {
      title: "Time Info",
      key: "timeInfo",
      sorter: (a, b) => new Date(a.checkInTime || 0) - new Date(b.checkInTime || 0),
      render: (_, record) => (
        <div className="flex flex-col gap-1 text-xs text-slate-600 min-w-[140px]">
          <div>
            <span className="font-medium">In:</span>{" "}
            {record.checkInTime
              ? new Date(record.checkInTime).toLocaleString()
              : "-"}
          </div>
          <div>
            <span className="font-medium">Out:</span>{" "}
            {record.checkOutTime
              ? new Date(record.checkOutTime).toLocaleString()
              : "-"}
          </div>
        </div>
      ),
    },
    {
      title: "Check-in Image",
      dataIndex: "checkinImageUrl",
      key: "checkinImageUrl",
      render: (url) =>
        url ? (
          <Image
            src={url}
            width={60}
            height={40}
            className="object-cover rounded-md border border-slate-200"
          />
        ) : (
          <span className="text-slate-400 text-xs italic">No image</span>
        ),
    },
    {
      title: "Check-out Image",
      dataIndex: "checkoutImageUrl",
      key: "checkoutImageUrl",
      render: (url) =>
        url ? (
          <Image
            src={url}
            width={60}
            height={40}
            className="object-cover rounded-md border border-slate-200"
          />
        ) : (
          <span className="text-slate-400 text-xs italic">No image</span>
        ),
    },
    {
      title: "Status",
      key: "status",
      sorter: (a, b) => (a.status || "").localeCompare(b.status || ""),
      render: (_, record) => {
        const isCurrentlyActive = record.status === "ACTIVE";
        const targetStatus = isCurrentlyActive ? "INACTIVE" : "ACTIVE";
        return (
          <Popconfirm
            title="Confirm Status Change"
            description={`Are you sure you want to set this vehicle to ${targetStatus}?`}
            onConfirm={() =>
              handleToggleStatus(record.vehicleId, record.status, record.userId)
            }
            okText="Yes"
            cancelText="No"
          >
            <Switch
              checked={isCurrentlyActive}
              checkedChildren="ACTIVE"
              unCheckedChildren="INACTIVE"
              className={
                isCurrentlyActive
                  ? "bg-emerald-500 hover:bg-emerald-600"
                  : "bg-rose-500 hover:bg-rose-600"
              }
            />
          </Popconfirm>
        );
      },
    },
  ];

  // --- COLUMNS T2 ---
  const vehicleTypeColumns = [
    {
      title: "Type Name",
      dataIndex: "typeName",
      key: "typeName",
      render: (text) => (
        <span className="font-semibold text-slate-800">{text}</span>
      ),
    },
    {
      title: "Size Category",
      dataIndex: "sizeCategory",
      key: "sizeCategory",
      render: (sizeCategory) => {
        const config = {
          SMALL: { color: "cyan", text: "Small Size" },
          MEDIUM: { color: "blue", text: "Medium Size" },
          LARGE: { color: "purple", text: "Large Size" },
        };
        const badgeData = config[sizeCategory] || {
          color: "default",
          text: sizeCategory,
        };
        return (
          <Badge
            color={badgeData.color}
            text={
              <span className="font-medium text-slate-600">
                {badgeData.text}
              </span>
            }
          />
        );
      },
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text) => <span className="text-slate-500 italic">{text}</span>,
    },
    {
      title: "Action",
      key: "action",
      width: 120,
      align: "center",
      render: (_, record) => (
        <div className="flex items-center justify-center gap-3">
          <Tooltip title="Edit Type">
            <Button
              type="text"
              icon={<Edit className="w-4 h-4 text-indigo-600" />}
              onClick={() => handleOpenUpdateModal(record)}
              className="hover:bg-indigo-50 flex items-center justify-center"
            />
          </Tooltip>

          <Popconfirm
            title="Delete Vehicle Type"
            description="Are you sure you want to delete this type? This action cannot be undone."
            onConfirm={() => handleDeleteType(record.vehicleTypeId)}
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
            placement="topLeft"
          >
            <Tooltip title="Delete Type">
              <Button
                type="text"
                danger
                icon={<Trash2 className="w-4 h-4" />}
                className="hover:bg-red-50 flex items-center justify-center"
              />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  // --- TABS CONTENT ---
  const tabItems = [
    {
      key: "1",
      label: (
        <span className="flex items-center gap-2 font-medium px-2">
          <CarFront className="w-4 h-4" /> Driver's vehicle
        </span>
      ),
      children: (
        <div className="grid grid-cols-1 gap-6 mt-2 animate-in fade-in duration-500">
          <div className="mb-6 rounded-2xl border border-indigo-50 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <div className="bg-gradient-to-r from-indigo-50/50 to-white px-6 py-4 border-b border-indigo-50 flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg text-indigo-600 shadow-sm border border-indigo-100">
                <Filter className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-800">
                Advanced Filter
              </h2>
            </div>
            <div className="p-6">
              <Form form={filterForm} layout="vertical" onFinish={handleSearch}>
                <Row gutter={[12, 4]}>
                  <Col xs={24} sm={12} md={8} lg={6}>
                    <Form.Item
                      name="plateNumber"
                      label={
                        <span className="font-medium text-slate-600">
                          Plate Number
                        </span>
                      }
                    >
                      <Input
                        placeholder="e.g. 59A-99999"
                        size="large"
                        className="rounded-lg hover:border-indigo-300 focus:border-indigo-500"
                        allowClear
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={6}>
                    <Form.Item
                      name="username"
                      label={
                        <span className="font-medium text-slate-600">
                          Username
                        </span>
                      }
                    >
                      <Input
                        placeholder="Search username"
                        size="large"
                        className="rounded-lg hover:border-indigo-300 focus:border-indigo-500"
                        allowClear
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={6}>
                    <Form.Item
                      name="status"
                      label={
                        <span className="font-medium text-slate-600">
                          Vehicle Status
                        </span>
                      }
                    >
                      <Select
                        placeholder="Select status"
                        size="large"
                        className="rounded-lg"
                        allowClear
                      >
                        <Select.Option value="ACTIVE">ACTIVE</Select.Option>
                        <Select.Option value="INACTIVE">INACTIVE</Select.Option>
                        <Select.Option value="BLOCKED">BLOCKED</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={6}>
                    <Form.Item
                      name="vehicleTypeId"
                      label={
                        <span className="font-medium text-slate-600">
                          Vehicle Type
                        </span>
                      }
                    >
                      <Select
                        placeholder="Select type"
                        size="large"
                        className="rounded-lg"
                        allowClear
                      >
                        {vehicleTypes?.map((type) => (
                          <Select.Option
                            key={type.vehicleTypeId}
                            value={type.vehicleTypeId}
                          >
                            {type.typeName}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={8} lg={6}>
                    <Form.Item
                      name="parked"
                      label={
                        <span className="font-medium text-slate-600">
                          Parked Status
                        </span>
                      }
                    >
                      <Select
                        placeholder="All"
                        size="large"
                        className="rounded-lg"
                        allowClear
                      >
                        <Select.Option value={true}>
                          Currently Parked
                        </Select.Option>
                        <Select.Option value={false}>
                          Not in parking lot
                        </Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={6}>
                    <Form.Item
                      name="checkInFrom"
                      label={
                        <span className="font-medium text-slate-600">
                          Check In Time
                        </span>
                      }
                    >
                      <DatePicker
                        showTime
                        size="large"
                        className="w-full rounded-lg hover:border-indigo-300"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={6}>
                    <Form.Item
                      name="checkInTo"
                      label={
                        <span className="font-medium text-slate-600">
                          Check Out Time
                        </span>
                      }
                    >
                      <DatePicker
                        showTime
                        size="large"
                        className="w-full rounded-lg hover:border-indigo-300"
                      />
                    </Form.Item>
                  </Col>

                  <Col
                    xs={24}
                    className="flex justify-end pt-2 border-t border-slate-100 mt-2"
                  >
                    <div className="flex gap-3">
                      <Button
                        onClick={handleResetFilter}
                        icon={<RefreshCw className="w-4 h-4" />}
                        size="large"
                        className="rounded-xl border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-300 transition-all font-medium px-6"
                      >
                        Reset Filter
                      </Button>
                      <Button
                        type="primary"
                        htmlType="submit"
                        icon={<Search className="w-4 h-4" />}
                        size="large"
                        className="rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-[0_4px_14px_0_rgb(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-[1px] transition-all font-medium px-8"
                      >
                        Search Vehicles
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Form>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden min-h-[400px]">
            <div>
              <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    All Vehicles
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="default"
                    className="!rounded-lg !font-semibold"
                    onClick={() => applyPreset("TODAY")}
                  >
                    Today
                  </Button>
                  <Button
                    type="default"
                    className="!rounded-lg !font-semibold"
                    onClick={() => applyPreset("7D")}
                  >
                    7D
                  </Button>
                  <Button
                    type="default"
                    className="!rounded-lg !font-semibold"
                    onClick={() => applyPreset("30D")}
                  >
                    30D
                  </Button>
                  <Button
                    type="default"
                    className="!rounded-lg !font-semibold"
                    onClick={() => applyPreset("MONTH")}
                  >
                    This Month
                  </Button>
                  <Tag
                    color="blue"
                    className="px-3 py-1 text-sm rounded-full font-medium"
                  >
                    Total: {vehiclesList?.length || 0}
                  </Tag>
                </div>
              </div>
              <Table
                columns={vehicleColumns}
                dataSource={vehiclesList}
                rowKey="vehicleId"
                loading={isVehiclesLoading || isChangingStatus}
                pagination={{ pageSize: 10 }}
                locale={{
                  emptyText: <Empty description="No vehicles found" />,
                }}
                className="border border-slate-100 rounded-xl overflow-hidden"
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "2",
      label: (
        <span className="flex items-center gap-2 font-medium px-2">
          <List className="w-4 h-4" /> Vehicle Type
        </span>
      ),
      children: (
        <div className="mt-2 animate-in fade-in duration-500">
          {/* Vùng Thống kê (Nâng cấp giao diện) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-4 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-50 to-violet-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-inner border border-indigo-100/50">
                <LayoutGrid className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">
                  Total Types
                </p>
                <p className="text-3xl font-bold text-slate-800">
                  {totalTypes}
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-center relative overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
              <div className="flex justify-between items-center mb-2 z-10">
                <span className="text-sm font-semibold text-slate-500 tracking-wide">
                  SMALL
                </span>
                <Badge status="cyan" />
              </div>
              <span className="text-3xl font-bold text-slate-800 z-10">
                {smallTypesCount}
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-center relative overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
              <div className="flex justify-between items-center mb-2 z-10">
                <span className="text-sm font-semibold text-slate-500 tracking-wide">
                  MEDIUM
                </span>
                <Badge status="processing" color="blue" />
              </div>
              <span className="text-3xl font-bold text-slate-800 z-10">
                {mediumTypesCount}
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-center relative overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-purple-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
              <div className="flex justify-between items-center mb-2 z-10">
                <span className="text-sm font-semibold text-slate-500 tracking-wide">
                  LARGE
                </span>
                <Badge status="purple" />
              </div>
              <span className="text-3xl font-bold text-slate-800 z-10">
                {largeTypesCount}
              </span>
            </div>
          </div>

          {/* Bảng Dữ Liệu */}
          <div className="rounded-2xl border border-slate-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden min-h-[400px]">
            <div className="p-6">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Vehicle Types Portfolio
                  </h2>
                  <p className="text-sm text-slate-500">
                    Manage all supported vehicle sizes and categories
                  </p>
                </div>

                <Button
                  type="primary"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={handleOpenCreateModal}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 h-11 px-6 rounded-xl shadow-[0_4px_14px_0_rgb(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-[1px] transition-all font-medium"
                >
                  Create New Type
                </Button>
              </div>

              <Table
                columns={vehicleTypeColumns}
                dataSource={vehicleTypes}
                rowKey="vehicleTypeId"
                loading={isVehicleTypesLoading || isDeletingVehicleType} // Bật spinner khi đang xóa
                pagination={{ pageSize: 10 }}
                locale={{
                  emptyText: (
                    <Empty description="No vehicle types found. Create one!" />
                  ),
                }}
                className="border border-slate-100 rounded-xl overflow-hidden custom-table"
              />
            </div>
          </div>
        </div>
      ),
    },
  ];

  const breadcrumbPage =
    activeTab === "1" ? "vehiclemanagement" : "vehicletypes";

  return (
    <div className="p-6 bg-[#f8fafc] min-h-screen">
      {/* Header */}
      <div className="mb-6 rounded-3xl border border-indigo-50 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 opacity-50 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-gradient-to-tr from-blue-50 to-cyan-50 opacity-50 blur-2xl"></div>

        <div className="relative z-10">
          <div className="mb-6">
            <CommonBreadcrumb role="Manager" page={breadcrumbPage} />
          </div>

          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-200/50">
              <CarFront size={32} strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                {activeTab === "1"
                  ? "Vehicle Management"
                  : "Vehicle Types Portfolio"}
              </h1>
              <p className="mt-1.5 text-base font-medium text-slate-500">
                {activeTab === "1"
                  ? "Track and manage all registered driver vehicles within the system"
                  : "Classify and organize vehicle types for parking spot allocation"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Container */}
      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key)}
        items={tabItems}
        className="bg-transparent"
        type="card"
        size="large"
      />

      {/* --- MODAL CREATE --- */}
      <Modal
        title={
          <span className="text-lg font-bold">Create New Vehicle Type</span>
        }
        open={isCreateModalVisible}
        onCancel={handleCancelCreate}
        footer={null}
        destroyOnHidden
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateSubmit}
          className="mt-4"
        >
          <Form.Item
            label={<span className="font-medium">Type Name</span>}
            name="typeName"
            rules={[
              {
                required: true,
                message: "Please input the vehicle type name!",
              },
            ]}
          >
            <Input placeholder="e.g., SUV, Sedan, Motorbike..." size="large" />
          </Form.Item>

          <Form.Item
            label={<span className="font-medium">Size Category</span>}
            name="sizeCategory"
            rules={[
              { required: true, message: "Please select a size category!" },
            ]}
          >
            <Select placeholder="Select size category" size="large">
              <Select.Option value="SMALL">SMALL</Select.Option>
              <Select.Option value="MEDIUM">MEDIUM</Select.Option>
              <Select.Option value="LARGE">LARGE</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label={<span className="font-medium">Description</span>}
            name="description"
            rules={[{ required: true, message: "Please input a description!" }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Briefly describe this vehicle type..."
            />
          </Form.Item>

          <div className="flex justify-end gap-3 mt-8">
            <Button onClick={handleCancelCreate} size="large">
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isCreatingVehicleType}
              className="bg-indigo-600 hover:bg-indigo-700"
              size="large"
            >
              Confirm & Create
            </Button>
          </div>
        </Form>
      </Modal>

      {/* --- MODAL UPDATE --- */}
      <UpdateVehicleTypeModal
        visible={isUpdateModalVisible}
        onClose={handleCloseUpdateModal}
        initialData={selectedTypeData}
      />
    </div>
  );
};

export default VehicleManagement;
