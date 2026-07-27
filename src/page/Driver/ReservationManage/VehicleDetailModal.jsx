import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal, Spin, Tag } from "antd";
import { Car, Palette, Hash, ShieldCheck, CircleDot, FileText } from "lucide-react";
import { getVehicleByIdRequest } from "../../../redux/driver/vehicleManagement/getVehicleById/getVehicleByIdSlice";

const VehicleDetailModal = ({ open, onClose, vehicleId }) => {
    const dispatch = useDispatch();
    const { getVehicleById: vehicleData, loading, error } = useSelector(
        (state) => state.getVehicleById
    );

    useEffect(() => {
        if (open && vehicleId) {
            dispatch(getVehicleByIdRequest({ vehicleId }));
        }
    }, [open, vehicleId, dispatch]);

    const vehicle = vehicleData?.data || vehicleData;

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            centered
            width={480}
            destroyOnHidden
            title={null}
            className="vehicle-detail-modal"
        >
            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Spin size="large" />
                    <span className="text-sm text-slate-400 font-medium">Loading vehicle details...</span>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-400">
                        <Car size={28} />
                    </div>
                    <p className="text-sm text-red-500 font-medium">Failed to load vehicle details</p>
                    <p className="text-xs text-slate-400">{typeof error === "string" ? error : "An error occurred"}</p>
                </div>
            ) : vehicle ? (
                <div className="space-y-5">
                    {/* Header */}
                    <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200">
                            <Car size={28} strokeWidth={2} />
                        </div>
                        <div>
                            <h3 className="text-lg font-extrabold text-slate-800 leading-tight">
                                Vehicle Details
                            </h3>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">
                                Information about the reserved vehicle
                            </p>
                        </div>
                    </div>

                    {/* Plate number highlight */}
                    <div className="flex items-center justify-center rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 p-4 shadow-md">
                        <div className="text-center">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">License Plate</p>
                            <p className="text-2xl font-extrabold font-mono text-white tracking-wider">
                                {vehicle.plateNumber}
                            </p>
                        </div>
                    </div>

                    {/* Detail grid */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Brand */}
                        <DetailCard
                            icon={<ShieldCheck size={16} />}
                            label="Brand"
                            value={vehicle.brand}
                            iconBg="bg-indigo-50 text-indigo-600"
                        />

                        {/* Model */}
                        <DetailCard
                            icon={<Car size={16} />}
                            label="Model"
                            value={vehicle.model}
                            iconBg="bg-blue-50 text-blue-600"
                        />

                        {/* Color */}
                        <DetailCard
                            icon={<Palette size={16} />}
                            label="Color"
                            value={
                                <div className="flex items-center gap-2">
                                    <span
                                        className="h-4 w-4 rounded-full border border-slate-200 shadow-sm"
                                        style={{ backgroundColor: vehicle.vehicleColor || "#ccc" }}
                                    />
                                    <span className="capitalize">{vehicle.vehicleColor}</span>
                                </div>
                            }
                            iconBg="bg-pink-50 text-pink-600"
                        />

                        {/* Vehicle Type */}
                        <DetailCard
                            icon={<CircleDot size={16} />}
                            label="Vehicle Type"
                            value={
                                <Tag
                                    color={
                                        vehicle.vehicleTypeName?.toLowerCase().includes("motor") ||
                                            vehicle.vehicleTypeName?.toLowerCase().includes("bike")
                                            ? "orange"
                                            : "blue"
                                    }
                                    className="!text-xs !font-semibold !m-0"
                                >
                                    {vehicle.vehicleTypeName}
                                </Tag>
                            }
                            iconBg="bg-amber-50 text-amber-600"
                        />

                        {/* Status */}
                        {vehicle.vehicleStatus && (
                            <DetailCard
                                icon={<FileText size={16} />}
                                label="Status"
                                value={
                                    <Tag
                                        color={vehicle.vehicleStatus === "ACTIVE" ? "green" : "default"}
                                        className="!text-xs !font-semibold !m-0"
                                    >
                                        {vehicle.vehicleStatus}
                                    </Tag>
                                }
                                iconBg="bg-emerald-50 text-emerald-600"
                            />
                        )}

                    </div>

                    {/* Additional info: description/notes */}
                    {vehicle.description && (
                        <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Description</p>
                            <p className="text-sm text-slate-700">{vehicle.description}</p>
                        </div>
                    )}
                </div>
            ) : null}
        </Modal>
    );
};

// ─── Detail card sub-component ─────────────────────────────────────────────────
const DetailCard = ({ icon, label, value, iconBg }) => (
    <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5 transition-colors hover:bg-slate-100/80">
        <div className="flex items-center gap-2 mb-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${iconBg}`}>
                {icon}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
        </div>
        <div className="text-sm font-semibold text-slate-700 pl-9">
            {value || <span className="text-slate-300">—</span>}
        </div>
    </div>
);

export default VehicleDetailModal;
