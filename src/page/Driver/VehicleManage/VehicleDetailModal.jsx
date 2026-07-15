import { useState, useEffect } from "react";
import { Modal, Typography, Spin, Button, Form, Input, Select, Upload, message } from "antd";
import {
  Car,
  Hash,
  PaintBucket,
  Layers,
  ShieldCheck,
  X,
  Edit2,
  ScanLine,
  UploadCloud,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { updateVehicleRequest } from "../../../redux/driver/vehicleManagement/updateVehicle/updateVehicleSlice";
import { ocrPlateRequest, ocrPlateReset } from "../../../redux/staff/ocrPlate/ocrPlateSlice";

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

const formatPlateNumber = (plate, typeName = "") => {
  if (!plate) return plate;
  const cleanPlate = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const type = (typeName || "").toLowerCase();

  if (type.includes("motor") || type.includes("bike")) {
    // Motorbike: 59A1-12345 (prefix includes digit after letter)
    const match = cleanPlate.match(/^([0-9]{2}[A-Z]{1,2}[0-9])([0-9]{4,5})$/);
    if (match) return `${match[1]}-${match[2]}`;
  } else if (type.includes("car") || type.includes("suv") || type.includes("truck")) {
    // Car/SUV/Truck: 30H-68888 (prefix is digits + letters only)
    const match = cleanPlate.match(/^([0-9]{2}[A-Z]{1,2})([0-9]{4,5})$/);
    if (match) return `${match[1]}-${match[2]}`;
  }
  return cleanPlate;
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

  // States for Image Upload & OCR
  const [plateImageFile, setPlateImageFile] = useState(null);
  const [plateImageUrl, setPlateImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const ocrState = useSelector((state) => state.ocrPlate);
  const recognizedPlate = ocrState?.ocrPlate?.plateNumber;
  const ocrLoading = ocrState?.loading;

  const vehicle = getVehicleById?.data;
  const vehicleTypes = getAllVehicleType?.data || [];

  const selectedVehicleTypeId = Form.useWatch("vehicleTypeId", form);
  const selectedTypeObj = vehicleTypes.find((t) => t.vehicleTypeId === selectedVehicleTypeId);
  const typeName = selectedTypeObj?.typeName?.toLowerCase() || "";
  const isMotorbike = typeName.includes("motor") || typeName.includes("bike");
  const isCarOrTruck = typeName.includes("car") || typeName.includes("suv") || typeName.includes("truck");

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
      // Clear image states when opening edit mode
      setPlateImageFile(null);
      setPlateImageUrl("");
      dispatch(ocrPlateReset());
    }
  }, [vehicle, isEditing, form, dispatch]);

  useEffect(() => {
    if (isEditing && recognizedPlate) {
      form.setFieldsValue({ plateNumber: formatPlateNumber(recognizedPlate, typeName) });
    }
  }, [recognizedPlate, isEditing, form, typeName]);

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
    const formData = new FormData();
    if (plateImageFile) formData.append("image", plateImageFile);
    formData.append("plateNumber", values.plateNumber);
    if (values.vehicleTypeId) formData.append("vehicleTypeId", values.vehicleTypeId);
    if (values.brand) formData.append("brand", values.brand);
    if (values.model) formData.append("model", values.model);
    if (values.vehicleColor) formData.append("vehicleColor", values.vehicleColor);
    formData.append("vehicleId", vehicle.vehicleId);

    dispatch(updateVehicleRequest(formData));
  };

  const handleModalClose = () => {
    setIsEditing(false); // Reset lại trạng thái về View khi đóng
    setPlateImageFile(null);
    setPlateImageUrl("");
    dispatch(ocrPlateReset());
    onClose();
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
                    label={
                      <span className="font-semibold text-gray-700">
                        Update Vehicle Image <span className="text-gray-400 font-normal text-xs">(Auto-detect plate)</span>
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
                              <p className="text-sm font-medium text-slate-700">Upload new image</p>
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
                      placeholder={isMotorbike ? "e.g., 59A1-12345" : isCarOrTruck ? "e.g., 30H-68888" : "ENTER PLATE NUMBER"}
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
