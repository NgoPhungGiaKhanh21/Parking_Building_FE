import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Spin, Empty, Tag, Button } from "antd";
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
    Palette,
    Hash,
} from "lucide-react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

import { getCurrentSessionRequest } from "../../../redux/driver/session/currentSession/currentSessionSlice";
import { getProfileUserRequest } from "../../../redux/profileUser/getProfileUserSlice";
import { getDriverPaymentsRequest } from "../../../redux/driver/payment/getDriverPayments/getDriverPaymentsSlice";
import CommonBreadcrumb from "../../../components/Commandbreadcrumb/Commandbreadcrumb";
import PaidSessionsModal from "./PaidSessionsModal";

dayjs.extend(duration);

// ─── Status configs ────────────────────────────────────────────────────────────
const sessionStatusConfig = {
    ACTIVE: { color: "green", label: "Active", icon: <CheckCircle2 size={13} /> },
    COMPLETED: { color: "default", label: "Completed", icon: <CheckCircle2 size={13} /> },
    EXPIRED: { color: "red", label: "Expired", icon: <AlertCircle size={13} /> },
};

const paymentStatusConfig = {
    UNPAID: { color: "gold", label: "Unpaid" },
    FAILED: { color: "gold", label: "Unpaid" },
    PAID: { color: "green", label: "Paid" },
    CONFIRMED: { color: "green", label: "Confirmed" },
    PARTIAL: { color: "orange", label: "Partial" },
};

const confirmationStatusConfig = {
    CONFIRMED: { color: "green", label: "Confirmed" },
    PENDING: { color: "orange", label: "Pending" },
    FAILED: { color: "red", label: "Failed" },
};

const canPaySession = (status) => status === "UNPAID" || status === "FAILED";

const findLatestPaymentForSession = (payments, sessionId) => {
    if (!sessionId || !payments?.length) return null;
    return (
        [...payments]
            .filter((p) => p.sessionId === sessionId)
            .sort(
                (a, b) =>
                    dayjs(b.paymentTime).valueOf() - dayjs(a.paymentTime).valueOf(),
            )[0] ?? null
    );
};

// ─── Shared live tick (1 interval for all cards) ───────────────────────────────
const useLiveTick = () => {
    const [now, setNow] = useState(dayjs());
    useEffect(() => {
        const interval = setInterval(() => setNow(dayjs()), 1000);
        return () => clearInterval(interval);
    }, []);
    return now;
};

const formatDuration = (checkinTime, now) => {
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

// ─── Single Session Card ───────────────────────────────────────────────────────
const SessionCard = ({ session, now, latestPayment }) => {
    const navigate = useNavigate();
    const timer = formatDuration(session.checkinTime, now);
    const sessionCfg = sessionStatusConfig[session.sessionStatus] || { color: "default", label: session.sessionStatus, icon: null };
    const paymentCfg = paymentStatusConfig[session.paymentStatus] || { color: "default", label: session.paymentStatus };
    const confirmStatus = latestPayment?.paymentStatus;
    const confirmCfg = confirmStatus
        ? confirmationStatusConfig[confirmStatus] || {
              color: "default",
              label: confirmStatus,
          }
        : null;

    const activeTierIndex = useMemo(() => {
        if (!session.pricingTiers) return 0;
        const totalHours = timer.hours + timer.minutes / 60;
        for (let i = 0; i < session.pricingTiers.length; i++) {
            if (totalHours <= session.pricingTiers[i].maxHours) return i;
        }
        return session.pricingTiers.length - 1;
    }, [session.pricingTiers, timer.hours, timer.minutes]);

    return (
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            {/* ── Timer Hero ── */}
            <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-5 text-white">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                            <Clock size={24} className="text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-200">
                                Parking Duration
                            </p>
                            <p className="text-3xl font-black tracking-tight font-mono">
                                {timer.display}
                            </p>
                            <p className="text-xs text-emerald-200">
                                Since{" "}
                                <span className="font-bold text-white">
                                    {dayjs(session.checkinTime).format("DD/MM/YYYY HH:mm")}
                                </span>
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col items-center rounded-xl bg-white/10 backdrop-blur-sm px-5 py-3 border border-white/20">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-200">
                            Estimated Fee
                        </p>
                        <p className="text-2xl font-black">
                            {(session.estimatedFee || 0).toLocaleString("vi-VN")}đ
                        </p>
                        {session.parkingHours != null && (
                            <p className="text-[10px] text-emerald-200">
                                ~{session.parkingHours}h parked
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-5 space-y-4">
                {/* ── Status Tags ── */}
                <div className="flex items-center gap-2 flex-wrap">
                    <Tag icon={sessionCfg.icon} color={sessionCfg.color} className="flex items-center gap-1 !text-xs !font-semibold !px-3 !py-1">
                        {sessionCfg.label}
                    </Tag>
                    <Tag color={paymentCfg.color} className="!text-xs !font-semibold !px-3 !py-1">
                        {paymentCfg.label}
                    </Tag>
                    {confirmCfg && session.paymentStatus !== "CONFIRMED" && (
                        <Tag color={confirmCfg.color} className="!text-xs !font-semibold !px-3 !py-1">
                            {confirmCfg.label}
                        </Tag>
                    )}
                    {session.ticketCode && (
                        <code className="ml-auto rounded bg-emerald-50 px-2.5 py-1 text-xs font-mono font-bold text-emerald-700">
                            {session.ticketCode}
                        </code>
                    )}
                </div>

                {/* ── Location + Vehicle Grid ── */}
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 col-span-2 md:col-span-1">
                        <p className="text-[10px] font-bold uppercase text-blue-400 mb-0.5 flex items-center gap-1">
                            <ParkingCircle size={10} /> Slot
                        </p>
                        <p className="text-xl font-black text-blue-600">{session.slotName}</p>
                        <p className="text-[10px] text-blue-500">
                            Zone {session.zoneName} · {session.floorName}
                        </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[10px] font-bold uppercase text-slate-400 mb-0.5 flex items-center gap-1">
                            <Building2 size={10} /> Building
                        </p>
                        <p className="text-xs font-bold text-slate-700">{session.buildingName}</p>
                    </div>
                    <div className="rounded-xl bg-indigo-50 p-3">
                        <p className="text-[10px] font-bold uppercase text-indigo-400 mb-0.5 flex items-center gap-1">
                            <Hash size={10} /> Plate
                        </p>
                        <p className="text-sm font-black font-mono text-indigo-700">{session.vehiclePlate}</p>
                    </div>
                    <div className="rounded-xl bg-indigo-50 p-3">
                        <p className="text-[10px] font-bold uppercase text-indigo-400 mb-0.5 flex items-center gap-1">
                            <Car size={10} /> Vehicle
                        </p>
                        <p className="text-xs font-bold text-indigo-700">
                            {session.vehicleBrand} {session.vehicleModel}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                            <span
                                className="h-2.5 w-2.5 rounded-full border border-indigo-200"
                                style={{ backgroundColor: session.vehicleColor?.toLowerCase() || "#ccc" }}
                            />
                            <span className="text-[10px] text-indigo-500 capitalize">{session.vehicleColor}</span>
                        </div>
                    </div>
                </div>

                {/* ── Pricing Tiers ── */}
                {session.pricingTiers && session.pricingTiers.length > 0 && (
                    <div>
                        <p className="text-[10px] font-bold uppercase text-slate-400 mb-2 flex items-center gap-1.5">
                            <DollarSign size={10} /> Pricing Tiers
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {session.pricingTiers.map((tier, idx) => {
                                const isActive = idx === activeTierIndex;
                                return (
                                    <div
                                        key={idx}
                                        className={`relative flex flex-col items-center rounded-xl border-2 px-3 py-2 min-w-[80px] transition-all ${
                                            isActive
                                                ? "border-emerald-400 bg-emerald-50 shadow-sm scale-105"
                                                : "border-slate-100 bg-gradient-to-b from-slate-50 to-white"
                                        }`}
                                    >
                                        {isActive && (
                                            <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-2 py-0 text-[8px] font-bold uppercase tracking-wider text-white">
                                                Now
                                            </span>
                                        )}
                                        <span className={`text-[10px] font-bold uppercase tracking-wide mb-0.5 ${isActive ? "text-emerald-600" : "text-blue-500"}`}>
                                            {tier.tierLabel}
                                        </span>
                                        <span className={`text-sm font-extrabold ${isActive ? "text-emerald-700" : "text-slate-800"}`}>
                                            {tier.price.toLocaleString("vi-VN")}đ
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── Fee Summary ── */}
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3 border-t border-slate-100 pt-3">
                    <div className="rounded-lg bg-emerald-50 p-2.5">
                        <p className="text-[9px] font-bold uppercase text-emerald-500">Estimated Fee</p>
                        <p className="text-sm font-black text-emerald-700">
                            {(session.estimatedFee || 0).toLocaleString("vi-VN")}đ
                        </p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2.5">
                        <p className="text-[9px] font-bold uppercase text-slate-400">Base Price</p>
                        <p className="text-sm font-bold text-slate-700">
                            {(session.basePrice || 0).toLocaleString("vi-VN")}đ
                        </p>
                    </div>
                    <div className="rounded-lg bg-blue-50 p-2.5">
                        <p className="text-[9px] font-bold uppercase text-blue-500">Hourly Rate</p>
                        <p className="text-sm font-bold text-blue-700">
                            {(session.hourlyRate || 0).toLocaleString("vi-VN")}đ/h
                        </p>
                    </div>
                </div>

                {/* ── Pay Button (if unpaid) ── */}
                {canPaySession(session.paymentStatus) && (
                    <div className="border-t border-slate-100 pt-3">
                        <Button
                            type="primary"
                            icon={<CreditCard size={16} />}
                            onClick={() => navigate("/driver/payment")}
                            className="!font-semibold w-full"
                            size="large"
                        >
                            Pay Now
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Main component ────────────────────────────────────────────────────────────
const CurrentSession = () => {
    const dispatch = useDispatch();
    const now = useLiveTick();

    const { currentSession, loading, error } = useSelector(
        (state) => state.getCurrentSession
    );
    const { getProfileUser } = useSelector((state) => state.getProfileUser);
    const { payments } = useSelector((state) => state.getDriverPayments);

    const driverId = getProfileUser?.id ?? getProfileUser?.userId ?? "";

    useEffect(() => {
        dispatch(getCurrentSessionRequest());
        dispatch(getProfileUserRequest());
    }, [dispatch]);

    useEffect(() => {
        if (driverId) {
            dispatch(getDriverPaymentsRequest({ driverId, limit: 20 }));
        }
    }, [dispatch, driverId]);

    // Handle API response: { totalActiveSessions, sessions: [...] }
    const sessions = useMemo(() => {
        if (!currentSession) return [];
        if (currentSession.sessions && Array.isArray(currentSession.sessions)) {
            return currentSession.sessions;
        }
        // Fallback: single session object
        if (currentSession.sessionId) return [currentSession];
        return [];
    }, [currentSession]);

    const unpaidSessions = useMemo(
        () => sessions.filter((s) => canPaySession(s.paymentStatus)),
        [sessions]
    );

    const paidSessions = useMemo(
        () => sessions.filter((s) => !canPaySession(s.paymentStatus)),
        [sessions]
    );

    const totalFee = useMemo(
        () => unpaidSessions.reduce((sum, s) => sum + (s.estimatedFee || 0), 0),
        [unpaidSessions]
    );

    const [isPaidModalOpen, setIsPaidModalOpen] = useState(false);

    // ── No active session
    if (!loading && (error || sessions.length === 0)) {
        return (
            <div className="min-h-screen bg-[#f0f4ff] p-4 md:p-8">
                <div className="mb-6 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
                    <div className="mb-4">
                        <CommonBreadcrumb role="Driver" page="session" />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-600">
                            <Timer size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">
                                Current Sessions
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
                                    No Active Sessions
                                </p>
                                <p className="text-sm text-slate-400">
                                    You don't have any active parking sessions right now.
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
                                Current Sessions
                            </h1>
                            <p className="mt-1 font-medium text-slate-500">
                                You have{" "}
                                <span className="font-bold text-emerald-600">
                                    {unpaidSessions.length}
                                </span>{" "}
                                active unpaid {unpaidSessions.length === 1 ? "session" : "sessions"}.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {paidSessions.length > 0 && (
                            <Button
                                type="default"
                                className="!h-auto !py-3 !px-5 !rounded-xl !border-blue-200 !text-blue-600 font-semibold flex items-center gap-2 hover:!bg-blue-50"
                                onClick={() => setIsPaidModalOpen(true)}
                            >
                                <Clock size={18} />
                                Paid History ({paidSessions.length})
                            </Button>
                        )}
                        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-5 py-3 text-center">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                                Total Fee
                            </p>
                            <p className="text-xl font-black text-emerald-700">
                                {totalFee.toLocaleString("vi-VN")}đ
                            </p>
                        </div>
                        <div className="rounded-xl bg-blue-50 border border-blue-200 px-5 py-3 text-center">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500">
                                Unpaid Sessions
                            </p>
                            <p className="text-xl font-black text-blue-700">
                                {unpaidSessions.length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Session Cards ── */}
            <div className="space-y-6">
                {unpaidSessions.map((session) => (
                    <SessionCard
                        key={session.sessionId}
                        session={session}
                        now={now}
                        latestPayment={findLatestPaymentForSession(
                            payments,
                            session.sessionId,
                        )}
                    />
                ))}
            </div>

            <PaidSessionsModal 
                open={isPaidModalOpen} 
                onCancel={() => setIsPaidModalOpen(false)} 
                sessions={paidSessions}
                payments={payments}
            />
        </div>
    );
};

export default CurrentSession;
    