import { useState, useEffect } from "react";
import { Modal, Typography, Spin, Button, Form, Input, Select } from "antd";
import {
  Car,
  Hash,
  PaintBucket,
  Layers,
  ShieldCheck,
  X,
  Edit2,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { updateVehicleRequest } from "../../../redux/driver/vehicleManagement/updateVehicle/updateVehicleSlice"; // Cập nhật đúng đường dẫn của bạn

const { Title, Text } = Typography;
const { Option } = Select;

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

const getVehicleImage = (type) => {
  const typeName = type?.toLowerCase() || "";
  if (typeName.includes("car")) {
    return "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=80";
  }
  return "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80";
};

const VehicleDetailModal = ({ isVisible, onClose }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  // States quản lý chế độ Edit
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Lấy dữ liệu từ Redux
  const { getVehicleById, loading, error } = useSelector(
    (state) => state.getVehicleById,
  );
  const { loading: updateLoading, error: updateError } = useSelector(
    (state) => state.updateVehicle,
  );
  const { getAllVehicleType } = useSelector((state) => state.getAllVehicleType);

  const vehicle = getVehicleById?.data;
  const vehicleTypes = getAllVehicleType?.data || [];

  const selectedVehicleTypeId = Form.useWatch("vehicleTypeId", form);
  const selectedTypeObj = vehicleTypes.find((t) => t.vehicleTypeId === selectedVehicleTypeId);
  const typeName = selectedTypeObj?.typeName?.toLowerCase() || "";
  const isMotorbike = typeName.includes("motor") || typeName.includes("bike");

  // Tự động điền dữ liệu vào form khi bật chế độ Edit
  useEffect(() => {
    if (vehicle && isEditing) {
      form.setFieldsValue({
        plateNumber: vehicle.plateNumber,
        vehicleTypeId: vehicle.vehicleTypeId,
        brand: vehicle.brand,
        model: vehicle.model,
        vehicleColor: vehicle.vehicleColor,
      });
    }
  }, [vehicle, isEditing, form]);

  // Xử lý logic đóng Modal khi update thành công
  useEffect(() => {
    if (isSubmitted && !updateLoading) {
      if (!updateError) {
        setIsEditing(false);
        setIsSubmitted(false);
        onClose(); // Đóng modal khi success
      } else {
        setIsSubmitted(false); // Nếu lỗi thì cho phép submit lại
      }
    }
  }, [isSubmitted, updateLoading, updateError, onClose]);

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "#10B981";
      case "INACTIVE":
        return "#EF4444";
      case "PENDING":
        return "#F59E0B";
      default:
        return "#6B7280";
    }
  };

  const handleUpdate = (values) => {
    setIsSubmitted(true);
    // Truyền kèm vehicleId vào payload để Saga gọi API PUT
    dispatch(updateVehicleRequest({ vehicleId: vehicle.vehicleId, ...values }));
  };

  const handleModalClose = () => {
    setIsEditing(false); // Reset lại trạng thái về View khi đóng
    onClose();
  };

  return (
    <Modal
      open={isVisible}
      onCancel={handleModalClose}
      footer={null}
      destroyOnHidden
      centered
      width={480}
      closeIcon={
        <X className="w-5 h-5 text-gray-500 hover:text-gray-800 transition-colors bg-white/80 rounded-full p-1 box-content backdrop-blur-sm shadow-sm" />
      }
      styles={{
        body: { padding: 0 },
        content: { padding: 0, overflow: "hidden", borderRadius: "24px" },
      }}
    >
      {loading && !isEditing ? (
        <div className="flex justify-center items-center py-20 min-h-[400px]">
          <Spin size="large" tip="Loading vehicle details..." />
        </div>
      ) : error ? (
        <div className="p-8 text-center min-h-[400px] flex flex-col justify-center items-center">
          <div className="bg-red-50 p-4 rounded-2xl border border-red-100 text-red-500">
            <Text type="danger" className="text-base font-medium">
              Failed to load details: {error}
            </Text>
          </div>
        </div>
      ) : vehicle ? (
        <div className="flex flex-col bg-white">
          {/* BANNER HÌNH ẢNH XE */}
          <div className="relative h-56 w-full">
            <img
              src={vehicle.imageUrl || vehicle.checkinImageUrl || vehicle.checkoutImageUrl || getVehicleImage(vehicle.vehicleTypeName)}
              alt={vehicle.model}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

            {/* Trạng thái xe */}
            <div className="absolute top-4 left-4">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md bg-white/90 shadow-sm border border-white/20">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getStatusColor(vehicle.status) }}
                ></div>
                <span
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: getStatusColor(vehicle.status) }}
                >
                  {vehicle.status}
                </span>
              </div>
            </div>
          </div>

          {/* KHU VỰC HIỂN THỊ NỘI DUNG (VIEW HOẶC EDIT) */}
          <div className="px-6 pb-8 pt-6 relative -mt-4 bg-white rounded-t-3xl">
            {!isEditing ? (
              /* --- CHẾ ĐỘ VIEW (CHỈ XEM) --- */
              <>
                <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-6">
                  <div>
                    <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">
                      License Plate
                    </Text>
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                        <Hash className="w-6 h-6" />
                      </div>
                      <Title
                        level={2}
                        className="!mb-0 text-gray-800 tracking-tight font-mono"
                      >
                        {vehicle.plateNumber}
                      </Title>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-gray-500">
                      <ShieldCheck className="w-4 h-4" />
                      <Text className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Brand
                      </Text>
                    </div>
                    <Text className="text-lg font-bold text-gray-800 uppercase">
                      {vehicle.brand}
                    </Text>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Car className="w-4 h-4" />
                      <Text className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Model
                      </Text>
                    </div>
                    <Text className="text-lg font-bold text-gray-800 uppercase">
                      {vehicle.model}
                    </Text>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Layers className="w-4 h-4" />
                      <Text className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Type
                      </Text>
                    </div>
                    <Text className="text-lg font-bold text-gray-800 capitalize">
                      {vehicle.vehicleTypeName}
                    </Text>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-gray-500">
                      <PaintBucket className="w-4 h-4" />
                      <Text className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Color
                      </Text>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div
                        className="w-5 h-5 rounded-full border border-gray-300 shadow-sm"
                        style={{
                          backgroundColor: getColorHex(vehicle.vehicleColor),
                        }}
                      />
                      <Text className="text-base font-bold text-gray-800 capitalize">
                        {vehicle.vehicleColor}
                      </Text>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <Button
                    type="primary"
                    size="large"
                    icon={<Edit2 className="w-4 h-4" />}
                    className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl h-12 font-semibold shadow-md flex items-center justify-center gap-2"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Vehicle Info
                  </Button>
                </div>
              </>
            ) : (
              /* --- CHẾ ĐỘ EDIT (BIỂU MẪU SỬA) --- */
              <div className="animate-fade-in">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                  <Title level={4} className="!mb-0 text-gray-800">
                    Edit Vehicle
                  </Title>
                  <Button
                    type="text"
                    onClick={() => setIsEditing(false)}
                    className="text-gray-500 font-medium"
                  >
                    Cancel Edit
                  </Button>
                </div>

                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleUpdate}
                  requiredMark={false}
                >
                  <Form.Item
                    name="plateNumber"
                    label={
                      <span className="font-semibold text-gray-700">
                        Plate Number <span className="text-red-500">*</span>
                      </span>
                    }
                    normalize={(value) => (value ? value.toUpperCase() : value)}
                    rules={[
                      { required: true, message: "Please enter plate number!" },
                      {
                        validator: (_, value) => {
                          if (!value) return Promise.resolve();
                          if (!value.includes("-")) {
                            return Promise.reject(
                              new Error("Plate number must contain a hyphen (-)"),
                            );
                          }
                          if (isMotorbike) {
                            const regex = /^[1-9][0-9][A-Z][A-Z0-9]\s*-\s*[0-9]{4,5}$/;
                            if (!regex.test(value)) {
                              return Promise.reject(
                                new Error("Invalid format! Expected e.g. 59A1 - 12345"),
                              );
                            }
                          } else if (typeName) {
                            const regex = /^[1-9][0-9][A-Z]{1,2}\s*-\s*[0-9]{4,5}$/;
                            if (!regex.test(value)) {
                              return Promise.reject(
                                new Error("Invalid format! Expected e.g. 51A - 12345"),
                              );
                            }
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                    extra={
                      <span className="text-xs text-gray-500">
                        {isMotorbike
                          ? "Format: 59A1-12345 or 59A1 - 12345"
                          : "Format: 51A-12345 or 51A - 12345"}
                      </span>
                    }
                  >
                    <Input
                      placeholder={isMotorbike ? "e.g., 59A1 - 12345" : "e.g., 51A - 12345"}
                      size="large"
                      className="rounded-lg font-mono uppercase"
                    />
                  </Form.Item>

                  <Form.Item
                    name="vehicleTypeId"
                    label={
                      <span className="font-semibold text-gray-700">
                        Vehicle Type
                      </span>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please select a vehicle type!",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Select vehicle type"
                      size="large"
                      className="rounded-lg"
                      disabled
                    >
                      {vehicleTypes.map((type) => (
                        <Option
                          key={type.vehicleTypeId}
                          value={type.vehicleTypeId}
                        >
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
                          Brand
                        </span>
                      }
                      rules={[
                        { required: true, message: "Please enter brand!" },
                      ]}
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
                          Model
                        </span>
                      }
                      rules={[
                        { required: true, message: "Please enter model!" },
                      ]}
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
                      <span className="font-semibold text-gray-700">Color</span>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please select vehicle color!",
                      },
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

                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={updateLoading}
                    className="w-full mt-4 bg-green-600 hover:bg-green-700 rounded-xl h-12 font-semibold shadow-md"
                  >
                    Save Changes
                  </Button>
                </Form>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-10 text-center text-gray-500">No data available.</div>
      )}
    </Modal>
  );
};

export default VehicleDetailModal;
