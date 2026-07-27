import { Tag, Spin, Empty } from "antd";
import {
    Car,
    ParkingCircle,
    Clock,
    CheckCircle2,
    XCircle,
    Building2,
    ShieldCheck,
    MessageSquareText,
} from "lucide-react";
import dayjs from "dayjs";

// ─── Status config ─────────────────────────────────────────────────────────────
export const reservationStatusConfig = {
    PENDING: { color: "gold", icon: <Clock size={13} />, label: "Pending" },
    CHECKED_IN: { color: "blue", icon: <ShieldCheck size={13} />, label: "Checked In" },
    ACTIVE: { color: "green", icon: <CheckCircle2 size={13} />, label: "Active" },
    CONFIRMED: { color: "blue", icon: <CheckCircle2 size={13} />, label: "Confirmed" },
    COMPLETED: { color: "default", icon: <CheckCircle2 size={13} />, label: "Completed" },
    CANCELLED: { color: "red", icon: <XCircle size={13} />, label: "Cancelled" },
    EXPIRED: { color: "default", icon: <XCircle size={13} />, label: "Expired" },
};

// ─── Single Reservation Card ──────────────────────────────────────────────────
const ReservationCard = ({ r, onOpenVehicleModal, onCancelReservation }) => {
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
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Slot</p>
                        <p className="text-xl font-extrabold text-blue-600 leading-tight">{r.slotName}</p>
                        <p className="text-xs text-slate-500">Zone {r.zoneName} · {r.floorName}</p>
                    </div>
                </div>
                <Tag icon={cfg.icon} color={cfg.color} className="flex items-center gap-1 !text-xs !font-semibold !px-3 !py-1">
                    {cfg.label}
                </Tag>
            </div>

            {/* Detail grid */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-[10px] font-bold uppercase text-slate-400 mb-0.5">Building</p>
                    <p className="text-xs font-semibold text-slate-700 flex items-center gap-1"><Building2 size={11} />{r.buildingName}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-[10px] font-bold uppercase text-slate-400 mb-0.5">Start</p>
                    <p className="text-xs font-semibold text-slate-700">{dayjs(r.reservationStart).format("DD/MM/YYYY HH:mm")}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-[10px] font-bold uppercase text-slate-400 mb-0.5">Vehicle Type</p>
                    <p className="text-xs font-semibold text-slate-700">{r.floorVehicleTypeName}</p>
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
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                        Pricing Tiers
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
            {/* Cancel Reason */}
            {r.reservationStatus === "CANCELLED" && (r.cancelReason || r.reason) && (
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-3">
                    <XCircle size={14} className="mt-0.5 flex-shrink-0 text-red-500" />
                    <div>
                        <p className="text-[10px] font-bold uppercase text-red-500 mb-0.5">Cancel Reason</p>
                        <p className="text-xs text-red-800 leading-relaxed">{r.cancelReason || r.reason}</p>
                    </div>
                </div>
            )}

            {/* Reservation Note */}
            {r.reservationNote && (
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
                    <MessageSquareText size={14} className="mt-0.5 flex-shrink-0 text-amber-500" />
                    <div>
                        <p className="text-[10px] font-bold uppercase text-amber-500 mb-0.5">Note</p>
                        <p className="text-xs text-amber-800 leading-relaxed">{r.reservationNote}</p>
                    </div>
                </div>
            )}

            {/* Codes + Vehicle button */}
            <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3">
                {r.ticketCode && (
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase text-slate-400">Ticket:</span>
                        <code className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-mono font-bold text-emerald-700">{r.ticketCode}</code>
                    </div>
                )}
                {r.qrCode && (
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase text-slate-400">QR Code:</span>
                        <code className="rounded bg-blue-50 px-2 py-0.5 text-xs font-mono font-bold text-blue-700 break-all">{r.qrCode}</code>
                    </div>
                )}
                <button
                    type="button"
                    onClick={() => onOpenVehicleModal(r.vehicleId)}
                    className="ml-auto flex items-center gap-1.5 rounded-lg bg-blue-50 border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-all hover:bg-blue-100 hover:border-blue-300 hover:shadow-sm cursor-pointer"
                >
                    <Car size={14} />
                    View Vehicle
                </button>
                {r.reservationStatus === "PENDING" && onCancelReservation && (
                    <button
                        type="button"
                        onClick={() => onCancelReservation(r.reservationCode || r.ticketCode || r.reservationId)}
                        className="flex items-center gap-1.5 rounded-lg bg-red-50 border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-all hover:bg-red-100 hover:border-red-300 hover:shadow-sm cursor-pointer"
                    >
                        <XCircle size={14} />
                        Cancel
                    </button>
                )}
            </div>
        </div>
    );
};

// ─── Render helper: list of cards with loading / empty ─────────────────────────
export const renderReservationCards = (list, reservationsLoading, onOpenVehicleModal, onCancelReservation) => {
    if (reservationsLoading) {
        return <div className="flex justify-center py-16"><Spin size="large" /></div>;
    }
    if (list.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16">
                <Empty description="No reservations found" />
            </div>
        );
    }
    return list.map((r) => (
        <ReservationCard
            key={r.reservationId}
            r={r}
            onOpenVehicleModal={onOpenVehicleModal}
            onCancelReservation={onCancelReservation}
        />
    ));
};

export default ReservationCard;
