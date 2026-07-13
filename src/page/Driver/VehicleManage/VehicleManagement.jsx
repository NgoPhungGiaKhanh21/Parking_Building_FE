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
  Upload,
} from "antd";
import { Car, Hash, Plus, X, Trash2, ScanLine, UploadCloud, CheckCircle2, AlertCircle, ImageIcon } from "lucide-react";

import { ocrPlateRequest, ocrPlateReset } from "../../../redux/staff/ocrPlate/ocrPlateSlice";

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

const formatPlateNumber = (plate) => {
  if (!plate) return plate;
  const cleanPlate = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const match = cleanPlate.match(/^([0-9]{2}[A-Z]{1,2}[0-9]?)([0-9]{4,5})$/);
  if (match) {
    return `${match[1]}-${match[2]}`;
  }
  return cleanPlate;
};

const VehicleList = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const [plateImageFile, setPlateImageFile] = useState(null);
  const [plateImageUrl, setPlateImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const ocrState = useSelector((state) => state.ocrPlate);
  const recognizedPlate = ocrState?.ocrPlate?.plateNumber;
  const ocrLoading = ocrState?.loading;


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
      setPlateImageFile(null);
      setPlateImageUrl("");
      dispatch(ocrPlateReset());
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

  useEffect(() => {
    if (recognizedPlate) {
      form.setFieldsValue({ plateNumber: formatPlateNumber(recognizedPlate) });
    }
  }, [recognizedPlate, form]);

  const getVehicleImage = (type) => {
    const typeName = type?.toLowerCase() || "";
    if (typeName.includes("car")) {
      return "data:image/png;base64,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";
    }
    return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQY8pVXpFHWp-qPKYZsLe2v8p4ydykAl_OVXQ&s";
  };

  const vehicleData = getAllVehicles?.data || [];
  const vehicleTypes = getAllVehicleType?.data || [];

  const selectedVehicleTypeId = Form.useWatch("vehicleTypeId", form);
  const selectedTypeObj = vehicleTypes.find((t) => t.vehicleTypeId === selectedVehicleTypeId);
  const typeName = selectedTypeObj?.typeName?.toLowerCase() || "";
  const isMotorbike = typeName.includes("motor") || typeName.includes("bike");

  const handleCreateVehicle = (values) => {
    const formData = new FormData();
    if (plateImageFile) formData.append("image", plateImageFile);
    formData.append("plateNumber", values.plateNumber);
    if (values.vehicleTypeId) formData.append("vehicleTypeId", values.vehicleTypeId);
    if (values.brand) formData.append("brand", values.brand);
    if (values.model) formData.append("model", values.model);
    if (values.vehicleColor) formData.append("vehicleColor", values.vehicleColor);

    dispatch(createVehicleRequest(formData));
  };

  const showCreateModal = () => {
    setIsCreateModalVisible(true);
  };

  const handleCreateCancel = () => {
    setIsCreateModalVisible(false);
    form.resetFields();
    setPlateImageFile(null);
    setPlateImageUrl("");
    dispatch(ocrPlateReset());
  };

  const handleImageUpload = async (options) => {
    const { file, onSuccess, onError } = options;
    setIsUploading(true);
    dispatch(ocrPlateReset());

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPlateImageUrl(e.target.result);
        setIsUploading(false);
        onSuccess("Ok");
      };
      reader.readAsDataURL(file);
      setPlateImageFile(file);

      const formData = new FormData();
      formData.append("file", file);
      dispatch(ocrPlateRequest(formData));
    } catch (err) {
      setIsUploading(false);
      onError(err);
      message.error("Failed to upload image");
    }
  };

  const handleRemoveImage = () => {
    setPlateImageUrl("");
    setPlateImageFile(null);
    dispatch(ocrPlateReset());
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
                    src={vehicle.imageUrl || getVehicleImage(vehicle.vehicleTypeName)}
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
        destroyOnHidden
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
            label={
              <span className="font-semibold text-gray-700">
                Vehicle Image <span className="text-gray-400 font-normal text-xs">(Auto-detect plate)</span>
              </span>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Upload
                name="file"
                customRequest={handleImageUpload}
                showUploadList={false}
                accept="image/*"
              >
                <div
                  className={`flex h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all hover:bg-slate-50 ${
                    plateImageUrl ? "border-blue-300 bg-blue-50/30" : "border-slate-300 bg-white"
                  }`}
                >
                  {isUploading ? (
                    <Spin />
                  ) : plateImageUrl ? (
                    <div className="relative h-full w-full p-1">
                      <img
                        src={plateImageUrl}
                        alt="Vehicle"
                        className="h-full w-full rounded-lg object-contain"
                      />
                      <Button
                        type="text"
                        size="small"
                        icon={<X size={14} />}
                        className="absolute right-2 top-2 bg-white/80 hover:bg-red-50 hover:text-red-500 shadow-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage();
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center p-4 text-center">
                      <div className="mb-2 rounded-full bg-blue-50 p-2 text-blue-500">
                        <UploadCloud size={20} />
                      </div>
                      <p className="text-sm font-medium text-slate-700">Click to upload</p>
                      <p className="mt-1 text-[10px] text-slate-400">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                </div>
              </Upload>

              <div className="flex h-32 flex-col justify-center rounded-xl border border-slate-200 bg-slate-50 p-3">
                {ocrLoading ? (
                  <div className="flex flex-col items-center">
                    <Spin size="small" />
                    <p className="mt-2 text-xs text-blue-600 animate-pulse">Reading plate...</p>
                  </div>
                ) : recognizedPlate ? (
                  <div className="flex flex-col items-center text-center">
                    <CheckCircle2 size={20} className="mb-1 text-emerald-500" />
                    <p className="text-xs font-medium text-emerald-700">Plate Detected</p>
                    <p className="mt-1 font-mono text-lg font-bold text-slate-800">{recognizedPlate}</p>
                  </div>
                ) : plateImageUrl ? (
                  <div className="flex flex-col items-center text-center">
                    <AlertCircle size={20} className="mb-1 text-amber-500" />
                    <p className="text-xs font-medium text-amber-700">Could not read plate</p>
                    <p className="text-[10px] text-slate-500">Please enter manually</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center text-slate-400">
                    <ScanLine size={24} className="mb-2 opacity-50" />
                    <p className="text-xs">OCR Result</p>
                  </div>
                )}
              </div>
            </div>
          </Form.Item>

          <Form.Item
            name="plateNumber"
            label={
              <span className="font-semibold text-gray-700">
                Plate Number <span className="text-red-500">*</span>
              </span>
            }
            normalize={(value) => (value ? value.toUpperCase() : value)}
            rules={[
              { required: true, message: "Please enter plate number!" }
            ]}
          >
            <Input
              placeholder={isMotorbike ? "e.g., 59A112345" : "e.g., 51A12345"}
              size="large"
              className="rounded-lg font-mono uppercase"
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
              { required: false, message: "Please select a vehicle type!" },
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
