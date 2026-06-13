import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Spin, Empty, Tag, Tooltip, Button } from "antd";
import {
    Car,
    Building2,
    Layers,
    ParkingCircle,
    Clock,
    DollarSign,
    Ticket,
    CheckCircle2,
    AlertCircle,
    Timer,
    MapPin,
    CreditCard,
    TrendingUp,
    Info,
    Palette,
    Hash,
} from "lucide-react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

import { getCurrentSessionRequest } from "../../../redux/driver/session/currentSession/currentSessionSlice";
import CommonBreadcrumb from "../../../components/Commandbreadcrumb/Commandbreadcrumb";

dayjs.extend(duration);

// ─── Status configs ────────────────────────────────────────────────────────────
const sessionStatusConfig = {
    ACTIVE: { color: "green", label: "Active", icon: <CheckCircle2 size={13} /> },
    COMPLETED: { color: "default", label: "Completed", icon: <CheckCircle2 size={13} /> },
    EXPIRED: { color: "red", label: "Expired", icon: <AlertCircle size={13} /> },
};

const paymentStatusConfig = {
    UNPAID: { color: "gold", label: "Unpaid" },
    PAID: { color: "green", label: "Paid" },
    PARTIAL: { color: "orange", label: "Partial" },
};

// ─── Live timer hook ───────────────────────────────────────────────────────────
const useLiveTimer = (checkinTime) => {
    const [now, setNow] = useState(dayjs());

    useEffect(() => {
        if (!checkinTime) return;
        const interval = setInterval(() => setNow(dayjs()), 1000);
        return () => clearInterval(interval);
    }, [checkinTime]);

    if (!checkinTime) return { hours: 0, minutes: 0, seconds: 0, display: "00:00:00" };

    const diff = dayjs.duration(now.diff(dayjs(checkinTime)));
    const totalHours = Math.floor(diff.asHours());
    const minutes = diff.minutes();
    const seconds = diff.seconds();

    return {
        hours: totalHours,
        minutes,
        seconds,
        display: `${String(totalHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
    };
};

// ─── Main component ────────────────────────────────────────────────────────────
const CurrentSession = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { currentSession, loading, error } = useSelector(
        (state) => state.getCurrentSession
    );

    useEffect(() => {
        dispatch(getCurrentSessionRequest());
    }, [dispatch]);

    const session = currentSession;
    const timer = useLiveTimer(session?.checkinTime);

    const sessionCfg = sessionStatusConfig[session?.sessionStatus] || {
        color: "default",
        label: session?.sessionStatus,
        icon: null,
    };
    const paymentCfg = paymentStatusConfig[session?.paymentStatus] || {
        color: "default",
        label: session?.paymentStatus,
    };

    // Find active pricing tier
    const activeTierIndex = useMemo(() => {
        if (!session?.pricingTiers || !timer.hours && !timer.minutes) return 0;
        const totalHours = timer.hours + timer.minutes / 60;
        for (let i = 0; i < session.pricingTiers.length; i++) {
            if (totalHours <= session.pricingTiers[i].maxHours) return i;
        }
        return session.pricingTiers.length - 1;
    }, [session?.pricingTiers, timer.hours, timer.minutes]);

    // ── No active session
    if (!loading && (error || !session)) {
        return (
            <div className="min-h-screen bg-[#f0f4ff] p-4 md:p-8">
                <div className="mb-6 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
                    <div className="mb-4">
                        <CommonBreadcrumb role="Driver" page="current-session" />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-600">
                            <Timer size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">
                                Current Session
                            </h1>
                            <p className="mt-1 font-medium text-slate-500">
                                View your active parking session details.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-20">
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            <div className="text-center">
                                <p className="text-base font-semibold text-slate-500 mb-1">
                                    No Active Session
                                </p>
                                <p className="text-sm text-slate-400">
                                    You don't have any active parking session right now.
                                </p>
                            </div>
                        }
                    />
                </div>
            </div>
        );
    }

    // ── Loading
    if (loading) {
        return (
            <div className="min-h-screen bg-[#f0f4ff] flex items-center justify-center">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f0f4ff] p-4 md:p-8">
            {/* ── Header ── */}
            <div className="mb-6 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
                <div className="mb-4">
                    <CommonBreadcrumb role="Driver" page="session" />
                </div>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-600">
                            <Timer size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">
                                Current Session
                            </h1>
                            <p className="mt-1 font-medium text-slate-500">
                                Your vehicle is currently parked.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Tag
                            icon={sessionCfg.icon}
                            color={sessionCfg.color}
                            className="flex items-center gap-1 !text-sm !font-semibold !px-4 !py-1.5"
                        >
                            {sessionCfg.label}
                        </Tag>
                        <Tag
                            color={paymentCfg.color}
                            className="!text-sm !font-semibold !px-4 !py-1.5"
                        >
                            {paymentCfg.label}
                        </Tag>
                        {session.paymentStatus === "UNPAID" && (
                            <Button
                                type="primary"
                                icon={<CreditCard size={16} />}
                                onClick={() => navigate("/driver/payment")}
                                className="!font-semibold"
                            >
                                Pay Now
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Live Timer Card ── */}
            <div className="mb-6 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-6 shadow-lg text-white">
                <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                            <Clock size={32} className="text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-emerald-200">
                                Parking Duration
                            </p>
                            <p className="text-4xl font-black tracking-tight md:text-5xl font-mono">
                                {timer.display}
                            </p>
                            <p className="text-sm text-emerald-200 mt-1">
                                Checked in at{" "}
                                <span className="font-bold text-white">
                                    {dayjs(session.checkinTime).format("DD/MM/YYYY HH:mm")}
                                </span>
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-1 rounded-2xl bg-white/10 backdrop-blur-sm px-8 py-4 border border-white/20">
                        <p className="text-xs font-bold uppercase tracking-widest text-emerald-200">
                            Current Fee
                        </p>
                        <p className="text-3xl font-black md:text-4xl">
                            {(session.currentAccumulatedFee || 0).toLocaleString("vi-VN")}đ
                        </p>
                        {session.currentFeeExplanation && (
                            <p className="text-xs text-emerald-200 mt-0.5">
                                {session.currentFeeExplanation}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* ── Location Info ── */}
                <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                        <MapPin size={14} className="text-blue-500" />
                        Parking Location
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 col-span-2">
                            <p className="text-[10px] font-bold uppercase text-blue-400 mb-1 flex items-center gap-1">
                                <ParkingCircle size={10} /> Slot
                            </p>
                            <p className="text-3xl font-black text-blue-600">
                                {session.slotName}
                            </p>
                            <p className="text-xs text-blue-500 mt-0.5">
                                Zone {session.zoneName} · {session.floorName}
                            </p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-[10px] font-bold uppercase text-slate-400 mb-0.5 flex items-center gap-1">
                                <Building2 size={10} /> Building
                            </p>
                            <p className="text-sm font-bold text-slate-700">
                                {session.buildingName}
                            </p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-[10px] font-bold uppercase text-slate-400 mb-0.5 flex items-center gap-1">
                                <Layers size={10} /> Floor
                            </p>
                            <p className="text-sm font-bold text-slate-700">
                                {session.floorName}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Vehicle Info ── */}
                <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                        <Car size={14} className="text-indigo-500" />
                        Vehicle Information
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4 col-span-2">
                            <p className="text-[10px] font-bold uppercase text-indigo-400 mb-1 flex items-center gap-1">
                                <Hash size={10} /> Plate Number
                            </p>
                            <p className="text-2xl font-black font-mono text-indigo-700 tracking-wider">
                                {session.vehiclePlate}
                            </p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-[10px] font-bold uppercase text-slate-400 mb-0.5">
                                Brand & Model
                            </p>
                            <p className="text-sm font-bold text-slate-700">
                                {session.vehicleBrand} {session.vehicleModel}
                            </p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-[10px] font-bold uppercase text-slate-400 mb-0.5 flex items-center gap-1">
                                <Palette size={10} /> Color
                            </p>
                            <div className="flex items-center gap-1.5">
                                <span
                                    className="h-3.5 w-3.5 rounded-full border border-slate-200 shadow-sm"
                                    style={{
                                        backgroundColor:
                                            session.vehicleColor?.toLowerCase() || "#ccc",
                                    }}
                                />
                                <span className="text-sm font-bold text-slate-700 capitalize">
                                    {session.vehicleColor}
                                </span>
                            </div>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-[10px] font-bold uppercase text-slate-400 mb-0.5">
                                Vehicle Type
                            </p>
                            <p className="text-sm font-bold text-slate-700">
                                {session.vehicleTypeName}
                            </p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-[10px] font-bold uppercase text-slate-400 mb-0.5 flex items-center gap-1">
                                <Ticket size={10} /> Ticket
                            </p>
                            <code className="text-sm font-bold font-mono text-emerald-700">
                                {session.ticketCode}
                            </code>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Pricing Tiers ── */}
            {session.pricingTiers && session.pricingTiers.length > 0 && (
                <div className="mt-6 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                        <DollarSign size={14} className="text-amber-500" />
                        Pricing Tiers
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        {session.pricingTiers.map((tier, idx) => {
                            const isActive = idx === activeTierIndex;
                            return (
                                <div
                                    key={idx}
                                    className={`relative flex flex-col items-center rounded-2xl border-2 px-5 py-4 min-w-[100px] transition-all ${
                                        isActive
                                            ? "border-emerald-400 bg-emerald-50 shadow-md scale-105"
                                            : "border-slate-100 bg-gradient-to-b from-slate-50 to-white"
                                    }`}
                                >
                                    {isActive && (
                                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm">
                                            Current
                                        </span>
                                    )}
                                    <span
                                        className={`text-xs font-bold uppercase tracking-wide mb-1 ${
                                            isActive ? "text-emerald-600" : "text-blue-500"
                                        }`}
                                    >
                                        {tier.tierLabel}
                                    </span>
                                    <span
                                        className={`text-lg font-black ${
                                            isActive ? "text-emerald-700" : "text-slate-800"
                                        }`}
                                    >
                                        {tier.price.toLocaleString("vi-VN")}đ
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Fee Breakdown ── */}
            <div className="mt-6 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                    <TrendingUp size={14} className="text-violet-500" />
                    Fee Details
                </h2>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
                        <p className="text-[10px] font-bold uppercase text-emerald-500 mb-1">
                            Current Fee
                        </p>
                        <p className="text-xl font-black text-emerald-700">
                            {(session.currentAccumulatedFee || 0).toLocaleString("vi-VN")}đ
                        </p>
                    </div>
                    <div className="rounded-xl bg-violet-50 border border-violet-100 p-4">
                        <p className="text-[10px] font-bold uppercase text-violet-500 mb-1">
                            Estimated Fee
                        </p>
                        <p className="text-xl font-black text-violet-700">
                            {(session.estimatedFee || 0).toLocaleString("vi-VN")}đ
                        </p>
                        {session.estimatedHours && (
                            <p className="text-[10px] text-violet-400 mt-0.5">
                                ~{session.estimatedHours}h estimated
                            </p>
                        )}
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">
                            Base Price
                        </p>
                        <p className="text-lg font-bold text-slate-700">
                            {(session.basePrice || 0).toLocaleString("vi-VN")}đ
                        </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">
                            Max Daily
                        </p>
                        <p className="text-lg font-bold text-slate-700">
                            {(session.maxDailyFee || 0).toLocaleString("vi-VN")}đ
                        </p>
                    </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3">
                    <div className="rounded-xl bg-amber-50 border border-amber-100 p-3">
                        <p className="text-[10px] font-bold uppercase text-amber-500 mb-0.5">
                            Hourly Rate
                        </p>
                        <p className="text-sm font-bold text-amber-700">
                            {(session.hourlyRate || 0).toLocaleString("vi-VN")}đ/h
                        </p>
                    </div>
                    <div className="rounded-xl bg-orange-50 border border-orange-100 p-3">
                        <p className="text-[10px] font-bold uppercase text-orange-500 mb-0.5">
                            Peak Multiplier
                        </p>
                        <p className="text-sm font-bold text-orange-700">
                            ×{session.peakHourMultiplier || 1}
                        </p>
                    </div>
                    <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-3">
                        <p className="text-[10px] font-bold uppercase text-indigo-500 mb-0.5">
                            Overnight Fee
                        </p>
                        <p className="text-sm font-bold text-indigo-700">
                            {(session.overnightFee || 0).toLocaleString("vi-VN")}đ
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CurrentSession;
