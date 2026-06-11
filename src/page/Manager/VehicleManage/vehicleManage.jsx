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
} from "antd";
import {
  CarFront,
  UserSearch,
  RefreshCw,
  List,
  Plus,
  Edit,
  Trash2,
  LayoutGrid,
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
import { getAllDriverRequest } from "../../../redux/manager/Vehicle/getAllDriver/getAllDriverSlice";
import { getVehicleManageRequest } from "../../../redux/manager/Vehicle/getVehicleManage/getVehicleManageSlice";

const VehicleManagement = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [activeTab, setActiveTab] = useState("1");

  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [selectedTypeData, setSelectedTypeData] = useState(null);

  // --- REDUX STATE ---
  const { getAllDriver: driversList, loading: isDriversLoading } = useSelector(
    (state) => state.getAllDriver
  );
  const { getVehicleManage: vehiclesList, loading: isVehiclesLoading } =
    useSelector((state) => state.getVehicleManage);
  const { loading: isChangingStatus } = useSelector(
    (state) => state.changeStatusVehicle
  );
  const { vehicleTypes, loading: isVehicleTypesLoading } = useSelector(
    (state) => state.getVehicleTypeList
  );
  const { loading: isCreatingVehicleType } = useSelector(
    (state) => state.createVehicleType || {}
  );

  // Lấy state loading của Delete để làm hiệu ứng loading trên bảng
  const { loading: isDeletingVehicleType } = useSelector(
    (state) => state.deleteVehicleType || {}
  );

  // --- EFFECTS ---
  useEffect(() => {
    dispatch(getAllDriverRequest());
    dispatch(getVehicleTypeListRequest());
  }, [dispatch]);

  // --- HANDLERS (TAB 1) ---
  const handleDriverChange = (userId) => {
    setSelectedDriverId(userId);
    dispatch(getVehicleManageRequest(userId));
  };

  const handleToggleStatus = (vehicleId, currentStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    dispatch(
      changeStatusVehicleRequest({
        vehicleId: vehicleId,
        status: newStatus,
        userId: selectedDriverId,
      })
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
      title: "Plate Number",
      dataIndex: "plateNumber",
      key: "plateNumber",
      render: (text) => (
        <span className="font-bold text-slate-700">{text}</span>
      ),
    },
    { title: "Brand", dataIndex: "brand", key: "brand" },
    { title: "Model", dataIndex: "model", key: "model" },
    {
      title: "Color",
      dataIndex: "vehicleColor",
      key: "vehicleColor",
      render: (color) => (
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
            style={{ backgroundColor: color?.toLowerCase() || "#ccc" }}
          ></div>
          <span className="capitalize">{color}</span>
        </div>
      ),
    },
    {
      title: "Vehicle Type",
      dataIndex: "vehicleTypeName",
      key: "vehicleTypeName",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={status === "ACTIVE" ? "green" : "volcano"}
          className="font-semibold"
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => {
        const isCurrentlyActive = record.status === "ACTIVE";
        const targetStatus = isCurrentlyActive ? "INACTIVE" : "ACTIVE";
        return (
          <Popconfirm
            title="Confirm Status Change"
            description={`Are you sure you want to set this vehicle to ${targetStatus}?`}
            onConfirm={() =>
              handleToggleStatus(record.vehicleId, record.status)
            }
            okText="Yes"
            cancelText="No"
          >
            <Button
              type={isCurrentlyActive ? "default" : "primary"}
              danger={isCurrentlyActive}
              size="small"
              icon={<RefreshCw className="w-3 h-3" />}
              className="flex items-center gap-1"
            >
              Set {targetStatus}
            </Button>
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
          <Card className="shadow-sm border-slate-200 rounded-xl">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-2 text-slate-700 font-semibold w-48">
                <UserSearch className="w-5 h-5 text-indigo-500" />
                Select Driver:
              </div>
              <div className="flex-1 max-w-md">
                <Select
                  showSearch
                  placeholder="Search and select driver..."
                  className="w-full h-11"
                  loading={isDriversLoading}
                  onChange={handleDriverChange}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={
                    driversList?.map((driver) => ({
                      value: driver.userId,
                      label: `${driver.fullName || "No Name"} (${
                        driver.username
                      }) - ${driver.email}`,
                    })) || []
                  }
                />
              </div>
            </div>
          </Card>

          <Card className="shadow-sm border-slate-200 rounded-xl min-h-[400px]">
            {!selectedDriverId ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <CarFront className="w-10 h-10 text-slate-300" />
                </div>
                <p className="text-lg">
                  Select a driver to view their vehicles
                </p>
              </div>
            ) : (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-800">
                    Driver's Vehicles
                  </h2>
                  <Tag
                    color="blue"
                    className="px-3 py-1 text-sm rounded-full font-medium"
                  >
                    Total: {vehiclesList?.length || 0}
                  </Tag>
                </div>
                <Table
                  columns={vehicleColumns}
                  dataSource={vehiclesList}
                  rowKey="vehicleId"
                  loading={isVehiclesLoading || isChangingStatus}
                  pagination={{ pageSize: 10 }}
                  locale={{
                    emptyText: (
                      <Empty description="This driver has no vehicles yet" />
                    ),
                  }}
                  className="border border-slate-100 rounded-lg overflow-hidden shadow-sm"
                />
              </div>
            )}
          </Card>
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
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                <LayoutGrid className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">
                  Total Types
                </p>
                <p className="text-2xl font-bold text-slate-800">
                  {totalTypes}
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-slate-500">
                  SMALL
                </span>
                <Badge status="cyan" />
              </div>
              <span className="text-xl font-bold text-slate-700">
                {smallTypesCount}
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-slate-500">
                  MEDIUM
                </span>
                <Badge status="processing" color="blue" />
              </div>
              <span className="text-xl font-bold text-slate-700">
                {mediumTypesCount}
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-slate-500">
                  LARGE
                </span>
                <Badge status="purple" />
              </div>
              <span className="text-xl font-bold text-slate-700">
                {largeTypesCount}
              </span>
            </div>
          </div>

          {/* Bảng Dữ Liệu */}
          <Card className="shadow-sm border-slate-200 rounded-xl min-h-[400px]">
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
                className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 h-10 px-5 rounded-lg shadow-sm"
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
              className="border border-slate-100 rounded-lg overflow-hidden shadow-sm custom-table"
            />
          </Card>
        </div>
      ),
    },
  ];

  const breadcrumbPage =
    activeTab === "1" ? "vehiclemanagement" : "vehicletypes";

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 rounded-2xl border border-violet-100 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <CommonBreadcrumb role="Manager" page={breadcrumbPage} />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-200 bg-violet-50 text-violet-600 shadow-inner">
            <CarFront size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">
              {activeTab === "1" ? "Vehicle Management" : "Vehicle Types Data"}
            </h1>
            <p className="mt-1 font-medium text-slate-500">
              {activeTab === "1"
                ? "Manage driver vehicles and oversee their current statuses"
                : "Manage vehicle type for all supported vehicle classifications"}
            </p>
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
        destroyOnClose
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
