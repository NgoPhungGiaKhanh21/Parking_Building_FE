import { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Spin,
    Tabs,
    Empty,
    Tag,
    Modal,
    Badge,
    Tooltip,
    Upload,
    message,
    Image,
} from "antd";
import {
    Car,
    CalendarDays,
    ClipboardList,
    Clock,
    CheckCircle2,
    XCircle,
    Building2,
    ShieldCheck,
    MessageSquareText,
    LogIn,
    User,
    Palette,
    Hash,
    MapPin,
    Layers,
    ParkingCircle,
    Ticket,
    DollarSign,
    AlertCircle,
    Upload as UploadIcon,
    ImageIcon,
} from "lucide-react";
import dayjs from "dayjs";

import { getAllReservationRequest } from "../../../redux/staff/reservation/getAllReservation/getAllReservationSlice";
import CommonBreadcrumb from "../../../components/Commandbreadcrumb/Commandbreadcrumb";
import { createCheckinRequest } from "../../../redux/staff/parking_session/checkin/createCheckinSlice";

// ─── Status config ─────────────────────────────────────────────────────────────
const reservationStatusConfig = {
    PENDING: { color: "gold", icon: <Clock size={13} />, label: "Pending" },
    CHECKED_IN: { color: "blue", icon: <ShieldCheck size={13} />, label: "Checked In" },
    ACTIVE: { color: "green", icon: <CheckCircle2 size={13} />, label: "Active" },
    CONFIRMED: { color: "blue", icon: <CheckCircle2 size={13} />, label: "Confirmed" },
    COMPLETED: { color: "default", icon: <CheckCircle2 size={13} />, label: "Completed" },
    CANCELLED: { color: "red", icon: <XCircle size={13} />, label: "Cancelled" },
    EXPIRED: { color: "default", icon: <XCircle size={13} />, label: "Expired" },
};

// ─── Reservation Card ──────────────────────────────────────────────────────────
const ReservationCard = ({ r, actions }) => {
    const cfg = reservationStatusConfig[r.reservationStatus] || {
        color: "default",
        icon: null,
        label: r.reservationStatus,
    };

    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            {/* Top row */}
            <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <ParkingCircle size={22} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Slot
                        </p>
                        <p className="text-xl font-extrabold text-blue-600 leading-tight">
                            {r.slotName}
                        </p>
                        <p className="text-xs text-slate-500">
                            Zone {r.zoneName} · {r.floorName}
                        </p>
                    </div>
                </div>
                <Tag
                    icon={cfg.icon}
                    color={cfg.color}
                    className="flex items-center gap-1 !text-xs !font-semibold !px-3 !py-1"
                >
                    {cfg.label}
                </Tag>
            </div>

            {/* Detail grid */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-[10px] font-bold uppercase text-slate-400 mb-0.5">
                        Building
                    </p>
                    <p className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                        <Building2 size={11} />
                        {r.buildingName}
                    </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-[10px] font-bold uppercase text-slate-400 mb-0.5">
                        Start
                    </p>
                    <p className="text-xs font-semibold text-slate-700">
                        {dayjs(r.reservationStart).format("DD/MM/YYYY HH:mm")}
                    </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-[10px] font-bold uppercase text-slate-400 mb-0.5">
                        Vehicle Type
                    </p>
                    <p className="text-xs font-semibold text-slate-700">
                        {r.floorVehicleTypeName}
                    </p>
                </div>
            </div>

            {/* Driver & Vehicle info */}
            <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-lg bg-indigo-50 p-3">
                    <p className="text-[10px] font-bold uppercase text-indigo-400 mb-0.5 flex items-center gap-1">
                        <User size={10} /> Driver
                    </p>
                    <p className="text-xs font-semibold text-indigo-700">{r.username}</p>
                </div>
                <div className="rounded-lg bg-indigo-50 p-3">
                    <p className="text-[10px] font-bold uppercase text-indigo-400 mb-0.5 flex items-center gap-1">
                        <Hash size={10} /> Plate
                    </p>
                    <p className="text-xs font-bold font-mono text-indigo-700">
                        {r.vehiclePlate}
                    </p>
                </div>
                <div className="rounded-lg bg-indigo-50 p-3">
                    <p className="text-[10px] font-bold uppercase text-indigo-400 mb-0.5 flex items-center gap-1">
                        <Car size={10} /> Vehicle
                    </p>
                    <p className="text-xs font-semibold text-indigo-700">
                        {r.vehicleBrand} {r.vehicleModel}
                    </p>
                </div>
                <div className="rounded-lg bg-indigo-50 p-3">
                    <p className="text-[10px] font-bold uppercase text-indigo-400 mb-0.5 flex items-center gap-1">
                        <Palette size={10} /> Color
                    </p>
                    <div className="flex items-center gap-1.5">
                        <span
                            className="h-3 w-3 rounded-full border border-indigo-200 shadow-sm"
                            style={{ backgroundColor: r.vehicleColor?.toLowerCase() || "#ccc" }}
                        />
                        <span className="text-xs font-semibold text-indigo-700 capitalize">
                            {r.vehicleColor}
                        </span>
                    </div>
                </div>
            </div>

            {/* Pricing Info */}
            {(r.basePrice != null || r.hourlyRate != null) && (
                <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
                    {r.basePrice != null && (
                        <div className="flex flex-col items-center rounded-xl border border-emerald-100 bg-gradient-to-b from-emerald-50 to-white px-3 py-2.5">
                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide mb-0.5">Base Price</span>
                            <span className="text-sm font-extrabold text-slate-800">{r.basePrice.toLocaleString("vi-VN")}đ</span>
                        </div>
                    )}
                    {r.hourlyRate != null && (
                        <div className="flex flex-col items-center rounded-xl border border-blue-100 bg-gradient-to-b from-blue-50 to-white px-3 py-2.5">
                            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wide mb-0.5">Hourly Rate</span>
                            <span className="text-sm font-extrabold text-slate-800">{r.hourlyRate.toLocaleString("vi-VN")}đ/h</span>
                        </div>
                    )}
                    {r.maxHours != null && (
                        <div className="flex flex-col items-center rounded-xl border border-amber-100 bg-gradient-to-b from-amber-50 to-white px-3 py-2.5">
                            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wide mb-0.5">Max Hours</span>
                            <span className="text-sm font-extrabold text-slate-800">{r.maxHours}h</span>
                        </div>
                    )}
                </div>
            )}

            {/* Pricing Tiers */}
            {r.pricingTiers && r.pricingTiers.length > 0 && (
                <div className="mt-3">
                    <p className="text-[10px] font-bold uppercase text-slate-400 mb-2 flex items-center gap-1.5">
                        <DollarSign size={10} /> Pricing Tiers
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {r.pricingTiers.map((tier, idx) => (
                            <div
                                key={idx}
                                className="flex flex-col items-center rounded-xl border border-blue-100 bg-gradient-to-b from-blue-50 to-white px-3 py-2 min-w-[80px]"
                            >
                                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wide mb-0.5">
                                    {tier.tierLabel}
                                </span>
                                <span className="text-sm font-extrabold text-slate-800">
                                    {tier.price.toLocaleString("vi-VN")}đ
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}


            {/* Check-in Image */}
            {r.checkinImageUrl && (
                <div
                    className="mt-4 rounded-2xl p-[2px]"
                    style={{
                        background: "linear-gradient(135deg, #6366f1, #3b82f6, #06b6d4)",
                    }}
                >
                    <div className="rounded-[14px] bg-white p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-sm">
                                <ImageIcon size={14} />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-transparent bg-clip-text"
                                style={{ backgroundImage: "linear-gradient(135deg, #6366f1, #06b6d4)" }}
                            >
                                Check-in Image
                            </span>
                        </div>
                        <div className="flex flex-col items-center w-full">
                            <div className="overflow-hidden rounded-xl shadow-lg ring-1 ring-slate-200/60" style={{ width: "fit-content" }}>
                                <Image
                                    src={r.checkinImageUrl}
                                    alt="Check-in vehicle"
                                    width={280}
                                    height={180}
                                    className="!rounded-xl !object-cover"
                                    style={{
                                        borderRadius: 12,
                                        objectFit: "cover",
                                        display: "block",
                                        transition: "transform 0.3s ease",
                                    }}
                                    placeholder={
                                        <div className="flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl"
                                            style={{ width: 280, height: 180 }}
                                        >
                                            <Spin size="small" />
                                        </div>
                                    }
                                />
                            </div>
                            <p className="mt-2 text-[10px] text-slate-400 font-medium">
                                Click to preview full image
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Ticket code + Actions */}
            <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3">
                {r.ticketCode && (
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase text-slate-400">
                            Ticket:
                        </span>
                        <code className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-mono font-bold text-emerald-700">
                            {r.ticketCode}
                        </code>
                    </div>
                )}

                {actions && <div className="ml-auto flex gap-2">{actions}</div>}
            </div>
        </div>
    );
};

// ─── Main component ────────────────────────────────────────────────────────────
const VehicleEntry = () => {
    const dispatch = useDispatch();
    const [mainTab, setMainTab] = useState("checkin");
    const [reservationSubTab, setReservationSubTab] = useState("CHECKED_IN");

    // ── Confirm modal state
    const [confirmModal, setConfirmModal] = useState({
        open: false,
        reservation: null,
    });
    const [checkinImageUrl, setCheckinImageUrl] = useState("");
    const [checkinImageFile, setCheckinImageFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    // ── Redux state
    const { getAllReservation, loading: reservationsLoading } = useSelector(
        (state) => state.getAllReservation
    );
    const { loading: checkinLoading } = useSelector(
        (state) => state.createCheckin
    );

    // ── Fetch on mount
    useEffect(() => {
        dispatch(getAllReservationRequest());
    }, [dispatch]);

    // ── Derived data
    const reservationList = useMemo(
        () => (Array.isArray(getAllReservation) ? getAllReservation : []),
        [getAllReservation]
    );

    const pendingList = useMemo(() => {
        const list = reservationList.filter((r) => r.reservationStatus === "PENDING");
        return list.sort((a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf());
    }, [reservationList]);

    const checkedInList = useMemo(
        () => reservationList.filter((r) => r.reservationStatus === "CHECKED_IN"),
        [reservationList]
    );
    const cancelledList = useMemo(
        () => reservationList.filter((r) => r.reservationStatus === "CANCELLED"),
        [reservationList]
    );

    // ── Handlers

    const handleCheckin = useCallback(
        (reservation) => {
            setConfirmModal({ open: true, reservation });
            setCheckinImageUrl("");
            setCheckinImageFile(null);
        },
        []
    );

    const handleConfirm = useCallback(() => {
        const { reservation } = confirmModal;
        if (!checkinImageFile) {
            message.error("Please upload a vehicle image before checking in.");
            return;
        }

        dispatch(
            createCheckinRequest({
                ticketCode: reservation.ticketCode,
                plateNumber: reservation.vehiclePlate,
                vehicleColor: reservation.vehicleColor,
                vehicleTypeId: reservation.floorVehicleTypeId,
                checkinImage: checkinImageFile,
            })
        );
        setConfirmModal({ open: false, reservation: null });
        setCheckinImageUrl("");
        setCheckinImageFile(null);
    }, [confirmModal, checkinImageFile, dispatch]);


    const handleCancelModal = useCallback(() => {
        setConfirmModal({ open: false, reservation: null });
        setCheckinImageUrl("");
        setCheckinImageFile(null);
    }, []);

    // ── Render helpers
    const renderReservationList = (list, actionRenderer) => {
        if (reservationsLoading) {
            return (
                <div className="flex justify-center py-16">
                    <Spin size="large" />
                </div>
            );
        }
        if (list.length === 0) {
            return (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16">
                    <Empty description="No reservations found" />
                </div>
            );
        }
        return (
            <div className="space-y-4">
                {list.map((r) => (
                    <ReservationCard
                        key={r.reservationId}
                        r={r}
                        actions={actionRenderer ? actionRenderer(r) : null}
                    />
                ))}
            </div>
        );
    };

    // ── Checkin Tab Content
    const CheckinTab = () => (
        <div>
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-blue-50 border border-blue-200 p-3">
                <AlertCircle size={16} className="text-blue-600 flex-shrink-0" />
                <p className="text-xs text-blue-700 font-medium">
                    Only the <strong>OLDEST PENDING</strong> reservation is shown here to process the queue in order.
                </p>
            </div>
            {renderReservationList(pendingList.slice(0, 1), (r) => (
                <button
                    type="button"
                    onClick={() => handleCheckin(r)}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-emerald-700 hover:shadow-md cursor-pointer active:scale-95"
                >
                    <LogIn size={14} />
                    Check In
                </button>
            ))}
        </div>
    );

    // ── Manage Reservations Tab Content
    const ManageReservationsTab = () => (
        <div>
            <Tabs
                activeKey={reservationSubTab}
                onChange={setReservationSubTab}
                size="small"
                className="reservation-sub-tabs"
                items={[
                    {
                        key: "CHECKED_IN",
                        label: (
                            <span className="flex items-center gap-1.5 font-medium text-sm">
                                <ShieldCheck size={14} />
                                Checked In
                                {checkedInList.length > 0 && (
                                    <Badge
                                        count={checkedInList.length}
                                        size="small"
                                        style={{ backgroundColor: "#3b82f6" }}
                                    />
                                )}
                            </span>
                        ),
                        children: renderReservationList(checkedInList),
                    },
                    {
                        key: "CANCELLED",
                        label: (
                            <span className="flex items-center gap-1.5 font-medium text-sm">
                                <XCircle size={14} />
                                Cancelled
                            </span>
                        ),
                        children: renderReservationList(cancelledList),
                    },
                ]}
            />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f0f4ff] p-4 md:p-8">
            {/* ── Header ── */}
            <div className="mb-6 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
                <div className="mb-4">
                    <CommonBreadcrumb role="Staff" page="entry" />
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-600">
                        <LogIn size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">
                            Vehicle Entry Management
                        </h1>
                        <p className="mt-1 font-medium text-slate-500">
                            Manage reservations and check in vehicles at the parking facility.
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Main Tabs ── */}
            <Tabs
                activeKey={mainTab}
                onChange={setMainTab}
                size="large"
                className="reservation-tabs"
                items={[
                    {
                        key: "checkin",
                        label: (
                            <span className="flex items-center gap-2 font-semibold">
                                <LogIn size={16} />
                                Check In
                                {pendingList.length > 0 && (
                                    <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                                        1
                                    </span>
                                )}
                            </span>
                        ),
                        children: <CheckinTab />,
                    },
                    {
                        key: "reservations",
                        label: (
                            <span className="flex items-center gap-2 font-semibold">
                                <ClipboardList size={16} />
                                Manage Reservations
                                {pendingList.length > 0 && (
                                    <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                                        {pendingList.length}
                                    </span>
                                )}
                            </span>
                        ),
                        children: <ManageReservationsTab />,
                    },
                ]}
            />

            {/* ── Confirm Modal ── */}
            <Modal
                open={confirmModal.open}
                onCancel={handleCancelModal}
                centered
                width={480}
                footer={null}
                destroyOnHidden
            >
                {confirmModal.reservation && (
                    <div>
                        <div className="mb-5">
                            <div className="flex items-center gap-3 mb-2">
                                <div
                                    className="flex h-10 w-10 items-center justify-center rounded-xl text-white bg-emerald-600"
                                >
                                    <LogIn size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">
                                        Confirm Check In
                                    </h3>
                                    <p className="text-sm text-slate-500">
                                        Please upload the vehicle image before checking in.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Reservation summary */}
                        <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-3 mb-5">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-lg bg-white border border-slate-200 p-3">
                                    <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1">
                                        Ticket Code
                                    </p>
                                    <p className="text-sm font-bold font-mono text-emerald-700">
                                        {confirmModal.reservation.ticketCode}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-white border border-slate-200 p-3">
                                    <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1">
                                        Driver
                                    </p>
                                    <p className="text-sm font-bold text-slate-800">
                                        {confirmModal.reservation.username}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-white border border-slate-200 p-3">
                                    <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1">
                                        Slot
                                    </p>
                                    <p className="text-sm font-extrabold text-blue-600">
                                        {confirmModal.reservation.slotName}
                                    </p>
                                    <p className="text-[10px] text-slate-500">
                                        Zone {confirmModal.reservation.zoneName} ·{" "}
                                        {confirmModal.reservation.floorName}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-white border border-slate-200 p-3">
                                    <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1">
                                        Plate Number
                                    </p>
                                    <p className="text-sm font-bold font-mono text-slate-800">
                                        {confirmModal.reservation.vehiclePlate}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-white border border-slate-200 p-3">
                                    <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1">
                                        Vehicle
                                    </p>
                                    <p className="text-sm font-bold text-slate-800">
                                        {confirmModal.reservation.vehicleBrand}{" "}
                                        {confirmModal.reservation.vehicleModel}
                                    </p>
                                    <p className="text-[10px] text-slate-500 capitalize">
                                        {confirmModal.reservation.vehicleColor} ·{" "}
                                        {confirmModal.reservation.floorVehicleTypeName}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-white border border-slate-200 p-3">
                                    <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1">
                                        Start
                                    </p>
                                    <p className="text-xs font-semibold text-slate-700">
                                        {dayjs(
                                            confirmModal.reservation.reservationStart
                                        ).format("DD/MM/YYYY HH:mm")}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Image Upload section */}
                        <div className="rounded-xl bg-white border border-slate-200 p-4 mb-5">
                            <p className="text-xs font-semibold uppercase text-slate-500 mb-3 flex items-center gap-1.5">
                                <UploadIcon size={14} /> Vehicle Check-in Image <span className="text-red-500">*</span>
                            </p>
                            <Upload
                                name="file"
                                listType="picture-card"
                                className="checkin-uploader"
                                showUploadList={false}
                                customRequest={async (options) => {
                                    const { file, onSuccess, onError } = options;
                                    setIsUploading(true);
                                    try {
                                        // Using standard FormData for Cloudinary
                                        const formData = new FormData();
                                        formData.append("file", file);
                                        formData.append("upload_preset", "your_preset_here"); // NOTE: this should use your project's upload logic

                                        // Simulating local object URL for immediate display since actual logic might be elsewhere
                                        // In real implementation, you'd call your image upload API here
                                        const reader = new FileReader();
                                        reader.onload = (e) => {
                                            setCheckinImageUrl(e.target.result);
                                            setCheckinImageFile(file);
                                            setIsUploading(false);
                                            onSuccess("Ok");
                                            message.success("Image added successfully");
                                        };
                                        reader.readAsDataURL(file);
                                    } catch (err) {
                                        setIsUploading(false);
                                        onError(err);
                                        message.error("Failed to add image");
                                    }
                                }}
                                beforeUpload={(file) => {
                                    const isImage = file.type.startsWith("image/");
                                    if (!isImage) message.error("You can only upload image files!");
                                    return isImage;
                                }}
                            >
                                {checkinImageUrl ? (
                                    <img src={checkinImageUrl} alt="Vehicle Check-in" className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                                        {isUploading ? <Spin size="small" /> : <UploadIcon size={20} />}
                                        <div className="text-xs font-medium">Click to Upload</div>
                                    </div>
                                )}
                            </Upload>
                        </div>

                        {/* Action buttons */}
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleCancelModal}
                                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:border-slate-300 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirm}
                                disabled={checkinLoading || isUploading || !checkinImageFile}
                                className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200"
                            >
                                {checkinLoading && <Spin size="small" />}
                                <LogIn size={16} />
                                Confirm Check In
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default VehicleEntry;
