import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  Spin,
  Empty,
  Typography,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
} from "antd";
import { Car, Hash, Plus, X, Trash2 } from "lucide-react";

// Đảm bảo đường dẫn import đúng với cấu trúc thư mục của bạn
import { getAllVehicleRequest } from "../../../redux/driver/vehicleManagement/getAllVehicle/getAllVehicleSlice";
import { getAllVehicleTypeRequest } from "../../../redux/driver/vehicleManagement/createVehicle/getAllTypeVehicleSlice";
import { createVehicleRequest } from "../../../redux/driver/vehicleManagement/createVehicle/createVehicleSlice";
import { getVehicleByIdRequest } from "../../../redux/driver/vehicleManagement/getVehicleById/getVehicleByIdSlice";
import { deleteVehicleRequest } from "../../../redux/driver/vehicleManagement/deleteVehicle/deleteVehicleSlice"; // Import action xóa xe
import CommonBreadcrumb from "../../../components/Commandbreadcrumb/Commandbreadcrumb";

// Import component Modal chi tiết
import VehicleDetailModal from "./VehicleDetailModal";

const { Title, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;

// Danh sách các màu xe phổ biến kèm mã HEX
const VEHICLE_COLORS = [
  { label: "Black", value: "Black", hex: "#1A1A1A" },
  { label: "White", value: "White", hex: "#FFFFFF" },
  { label: "Silver", value: "Silver", hex: "#C0C0C0" },
  { label: "Gray", value: "Gray", hex: "#808080" },
  { label: "Red", value: "Red", hex: "#DC2626" },
  { label: "Blue", value: "Blue", hex: "#2563EB" },
  { label: "Green", value: "Green", hex: "#16A34A" },
  { label: "Yellow", value: "Yellow", hex: "#FACC15" },
  { label: "Brown", value: "Brown", hex: "#78350F" },
];

const getColorHex = (colorName) => {
  const color = VEHICLE_COLORS.find(
    (c) => c.value.toLowerCase() === (colorName || "").toLowerCase(),
  );
  return color ? color.hex : "#E5E7EB";
};

const VehicleList = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  // State cho Modal Create
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

  // State cho Modal Detail
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);

  const {
    getAllVehicles,
    loading: vehiclesLoading,
    error: vehiclesError,
  } = useSelector((state) => state.getAllVehicle);

  const { getAllVehicleType, loading: typeLoading } = useSelector(
    (state) => state.getAllVehicleType,
  );

  const {
    createVehicle,
    loading: createLoading,
    error: createError,
  } = useSelector((state) => state.createVehicle);

  const {
    updateVehicle,
    loading: updateLoading,
    error: updateError,
  } = useSelector((state) => state.updateVehicle);

  // Lấy state Delete từ Redux
  const {
    deleteVehicle,
    loading: deleteLoading,
    error: deleteError,
  } = useSelector((state) => state.deleteVehicle);

  useEffect(() => {
    dispatch(getAllVehicleRequest());
    dispatch(getAllVehicleTypeRequest());
  }, [dispatch]);

  // Lắng nghe tạo xe
  useEffect(() => {
    if (createVehicle && !createLoading && !createError) {
      setIsCreateModalVisible(false);
      form.resetFields();
      dispatch(getAllVehicleRequest());
    } else if (createError) {
      message.error(createError || "Failed to add vehicle");
    }
  }, [createVehicle, createLoading, createError, dispatch, form]);

  // Lắng nghe cập nhật xe
  useEffect(() => {
    if (updateVehicle && !updateLoading && !updateError) {
      dispatch(getAllVehicleRequest());
    }
  }, [updateVehicle, updateLoading, updateError, dispatch]);

  // Lắng nghe khi xóa xe (Đảm bảo list load lại khi xóa thành công)
  useEffect(() => {
    if (deleteVehicle && !deleteLoading && !deleteError) {
      // Dù saga đã gọi getAllVehicleRequest, gọi ở đây thêm để đảm bảo UI đồng bộ
      dispatch(getAllVehicleRequest());
    }
  }, [deleteVehicle, deleteLoading, deleteError, dispatch]);

  const getVehicleImage = (type) => {
    const typeName = type?.toLowerCase() || "";
    if (typeName.includes("car")) {
      return "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=500&q=80";
    }
    return "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=500&q=80";
  };

  const vehicleData = getAllVehicles?.data || [];
  const vehicleTypes = getAllVehicleType?.data || [];

  const handleCreateVehicle = (values) => {
    dispatch(createVehicleRequest(values));
  };

  const showCreateModal = () => {
    setIsCreateModalVisible(true);
  };

  const handleCreateCancel = () => {
    setIsCreateModalVisible(false);
    form.resetFields();
  };

  const handleCardClick = (vehicleId) => {
    setSelectedVehicleId(vehicleId);
    dispatch(getVehicleByIdRequest({ vehicleId }));
    setIsDetailModalVisible(true);
  };

  const handleDetailCancel = () => {
    setIsDetailModalVisible(false);
    setSelectedVehicleId(null);
  };

  // --- HÀM XỬ LÝ NÚT DELETE BÊN NGOÀI CARD ---
  const handleDeleteVehicle = (e, vehicleId) => {
    // Ngăn sự kiện click lan truyền lên Card (tránh mở Modal chi tiết)
    e.stopPropagation();

    confirm({
      title: "Are you sure you want to delete this vehicle?",
      content:
        "This action cannot be undone. All data related to this vehicle will be lost.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      centered: true,
      onOk() {
        dispatch(deleteVehicleRequest({ vehicleId }));
      },
    });
  };

  if (vehiclesLoading && vehicleData.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" tip="Loading vehicle list..." />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* HEADER SECTION */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="mb-4">
            <CommonBreadcrumb role={"Driver"} page={"vehicle"} />
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 p-4 rounded-2xl flex items-center justify-center">
              <Car className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex flex-col">
              <Title level={2} className="!mb-1 !mt-0 text-[#1e293b]">
                My Vehicles
              </Title>
              <Text className="text-gray-500 text-base">
                View and manage all your personal vehicles on the system.
              </Text>
            </div>
          </div>
        </div>

        <Button
          type="primary"
          icon={<Plus className="w-5 h-5" />}
          size="large"
          className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 rounded-xl h-12 px-6 font-semibold shadow-md"
          onClick={showCreateModal}
        >
          Add Vehicle
        </Button>
      </div>

      {/* BODY SECTION - VEHICLE LIST */}
      {vehiclesError ? (
        <div className="text-center text-red-500 mt-10 bg-red-50 p-4 rounded-xl border border-red-100">
          <Text type="danger">An error occurred: {vehiclesError}</Text>
        </div>
      ) : vehicleData.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-gray-200 shadow-sm">
          <Empty description="You haven't registered any vehicles yet" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {vehicleData.map((vehicle) => (
            <Card
              key={vehicle.vehicleId}
              hoverable
              onClick={() => handleCardClick(vehicle.vehicleId)}
              className="overflow-hidden rounded-2xl border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer relative"
              styles={{ body: { padding: "20px" } }}
              cover={
                <div className="relative overflow-hidden h-52">
                  <img
                    alt={vehicle.model}
                    src={getVehicleImage(vehicle.vehicleTypeName)}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-in-out"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm border border-white/20 flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-xs font-bold text-gray-700 uppercase">
                      {vehicle.vehicleTypeName || "Vehicle"}
                    </span>
                  </div>
                </div>
              }
            >
              {/* Nút Xóa đè lên góc phải bên trong Body của Card */}
              <div
                className="absolute top-56 right-4 z-10 bg-red-50 hover:bg-red-100 p-2.5 rounded-full shadow-sm border border-red-100 transition-colors cursor-pointer group/delete"
                onClick={(e) => handleDeleteVehicle(e, vehicle.vehicleId)}
              >
                <Trash2 className="w-5 h-5 text-red-500 group-hover/delete:text-red-600" />
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col">
                  <Text className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    {vehicle.brand || "Brand"}
                  </Text>
                  <Text className="text-xl font-extrabold text-gray-800 tracking-tight leading-tight pr-10">
                    {vehicle.model}
                  </Text>
                </div>

                <div className="bg-gray-100 border-2 border-gray-300 rounded-lg py-2 px-3 flex items-center justify-center gap-2 w-fit">
                  <Hash className="w-4 h-4 text-gray-500" />
                  <Text className="text-lg font-mono font-bold text-gray-800 tracking-wider">
                    {vehicle.plateNumber}
                  </Text>
                </div>

                <div className="bg-blue-50/50 rounded-lg p-3 flex items-center gap-3 border border-blue-100/50">
                  <div className="bg-white p-2 rounded-md shadow-sm">
                    <div
                      className="w-5 h-5 rounded-full border border-gray-200 shadow-inner"
                      style={{
                        backgroundColor: getColorHex(vehicle.vehicleColor),
                      }}
                    />
                  </div>
                  <div className="flex flex-col">
                    <Text className="text-xs text-gray-500 font-medium uppercase">
                      Color
                    </Text>
                    <Text className="text-sm font-semibold text-gray-800 capitalize">
                      {vehicle.vehicleColor}
                    </Text>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* MODAL THÊM XE */}
      <Modal
        title={
          <div className="border-b pb-4 mb-2">
            <Title level={4} className="!mb-0 text-gray-800">
              Add New Vehicle
            </Title>
            <Text className="text-gray-500 text-sm font-normal">
              Enter the details of your new vehicle below.
            </Text>
          </div>
        }
        open={isCreateModalVisible}
        onCancel={handleCreateCancel}
        footer={null}
        destroyOnClose
        centered
        width={500}
        closeIcon={<X className="w-5 h-5 text-gray-400 mt-1 mr-1" />}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateVehicle}
          className="mt-2"
          requiredMark={false}
        >
          <Form.Item
            name="plateNumber"
            label={
              <span className="font-semibold text-gray-700">
                Plate Number <span className="text-red-500">*</span>
              </span>
            }
            rules={[{ required: true, message: "Please enter plate number!" }]}
          >
            <Input
              placeholder="e.g., 30A-678.90"
              size="large"
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item
            name="vehicleTypeId"
            label={
              <span className="font-semibold text-gray-700">
                Vehicle Type <span className="text-red-500">*</span>
              </span>
            }
            rules={[
              { required: true, message: "Please select a vehicle type!" },
            ]}
          >
            <Select
              placeholder="Select vehicle type"
              size="large"
              loading={typeLoading}
              className="rounded-lg"
            >
              {vehicleTypes.map((type) => (
                <Option key={type.vehicleTypeId} value={type.vehicleTypeId}>
                  {type.typeName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="brand"
              label={
                <span className="font-semibold text-gray-700">
                  Brand <span className="text-red-500">*</span>
                </span>
              }
              rules={[{ required: true, message: "Please enter brand!" }]}
            >
              <Input
                placeholder="e.g., Vinfast"
                size="large"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              name="model"
              label={
                <span className="font-semibold text-gray-700">
                  Model <span className="text-red-500">*</span>
                </span>
              }
              rules={[{ required: true, message: "Please enter model!" }]}
            >
              <Input
                placeholder="e.g., VF5"
                size="large"
                className="rounded-lg"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="vehicleColor"
            label={
              <span className="font-semibold text-gray-700">
                Color <span className="text-red-500">*</span>
              </span>
            }
            rules={[
              { required: true, message: "Please select vehicle color!" },
            ]}
          >
            <Select
              placeholder="Select a color"
              size="large"
              className="rounded-lg"
            >
              {VEHICLE_COLORS.map((color) => (
                <Option key={color.value} value={color.value}>
                  <div className="flex items-center gap-3">
                    <span
                      className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span>{color.label}</span>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
            <Button
              size="large"
              onClick={handleCreateCancel}
              className="rounded-xl font-medium px-6"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              className="bg-blue-600 hover:bg-blue-700 rounded-xl font-medium px-6 shadow-md"
              loading={createLoading}
            >
              Create Vehicle
            </Button>
          </div>
        </Form>
      </Modal>

      {/* MODAL CHI TIẾT XE */}
      <VehicleDetailModal
        isVisible={isDetailModalVisible}
        onClose={handleDetailCancel}
        vehicleId={selectedVehicleId}
      />
    </div>
  );
};

export default VehicleList;
