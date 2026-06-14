import { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Spin,
    Tabs,
    Empty,
    Tag,
    Modal,
    Select,
    Switch,
} from "antd";
import {
    Car,
    ClipboardList,
    Clock,
    CheckCircle2,
    XCircle,
    Building2,
    ShieldCheck,
    MessageSquareText,
    LogOut,
    User,
    Palette,
    Hash,
    ParkingCircle,
    Ticket,
    DollarSign,
    AlertCircle,
    ArrowLeftSquare,
} from "lucide-react";
import dayjs from "dayjs";

import { getAllReservationRequest } from "../../../redux/staff/reservation/getAllReservation/getAllReservationSlice";
import CommonBreadcrumb from "../../../components/Commandbreadcrumb/Commandbreadcrumb";
import {
    createCheckoutRequest,
    resetCheckout,
} from "../../../redux/staff/parking_session/checkout/createCheckoutSlice";

const PAYMENT_METHODS = [
    { value: "PAYOS", label: "PayOS" },
    { value: "CASH", label: "Cash" },
    { value: "MOMO", label: "MoMo" },
];

const reservationStatusConfig = {
    PENDING: { color: "gold", icon: <Clock size={13} />, label: "Pending" },
    APPROVED: { color: "cyan", icon: <ShieldCheck size={13} />, label: "Approved" },
    ACTIVE: { color: "green", icon: <CheckCircle2 size={13} />, label: "Active" },
    CONFIRMED: { color: "blue", icon: <CheckCircle2 size={13} />, label: "Confirmed" },
    COMPLETED: { color: "default", icon: <CheckCircle2 size={13} />, label: "Completed" },
    CANCELLED: { color: "red", icon: <XCircle size={13} />, label: "Cancelled" },
    EXPIRED: { color: "default", icon: <XCircle size={13} />, label: "Expired" },
};

const SessionCard = ({ r, actions }) => {
    const cfg = reservationStatusConfig[r.reservationStatus] || {
        color: "default",
        icon: null,
        label: r.reservationStatus,
    };

    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                        <ParkingCircle size={22} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Slot
                        </p>
                        <p className="text-xl font-extrabold text-orange-600 leading-tight">
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

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
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
                        End
                    </p>
                    <p className="text-xs font-semibold text-slate-700">
                        {dayjs(r.reservationEnd).format("DD/MM/YYYY HH:mm")}
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

            {r.pricingTiers && r.pricingTiers.length > 0 && (
                <div className="mt-3">
                    <p className="text-[10px] font-bold uppercase text-slate-400 mb-2 flex items-center gap-1.5">
                        <DollarSign size={10} /> Pricing Tiers
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {r.pricingTiers.map((tier, idx) => (
                            <div
                                key={idx}
                                className="flex flex-col items-center rounded-xl border border-orange-100 bg-gradient-to-b from-orange-50 to-white px-3 py-2 min-w-[80px]"
                            >
                                <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wide mb-0.5">
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

            {r.reservationNote && (
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
                    <MessageSquareText
                        size={14}
                        className="mt-0.5 flex-shrink-0 text-amber-500"
                    />
                    <div>
                        <p className="text-[10px] font-bold uppercase text-amber-500 mb-0.5">
                            Note
                        </p>
                        <p className="text-xs text-amber-800 leading-relaxed">
                            {r.reservationNote}
                        </p>
                    </div>
                </div>
            )}

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
                {r.reservationCode && (
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase text-slate-400">
                            Reservation:
                        </span>
                        <code className="rounded bg-violet-50 px-2 py-0.5 text-xs font-mono font-bold text-violet-700">
                            {r.reservationCode}
                        </code>
                    </div>
                )}
                {actions && <div className="ml-auto flex gap-2">{actions}</div>}
            </div>
        </div>
    );
};

const VehicleExit = () => {
    const dispatch = useDispatch();
    const [mainTab, setMainTab] = useState("checkout");
    const [confirmModal, setConfirmModal] = useState({
        open: false,
        reservation: null,
        paymentMethod: "PAYOS",
        lostTicket: false,
    });

    const { getAllReservation, loading: reservationsLoading } = useSelector(
        (state) => state.getAllReservation
    );
    const { loading: checkoutLoading } = useSelector(
        (state) => state.createCheckout
    );

    useEffect(() => {
        dispatch(getAllReservationRequest());
        return () => dispatch(resetCheckout());
    }, [dispatch]);

    const reservationList = useMemo(
        () => (Array.isArray(getAllReservation) ? getAllReservation : []),
        [getAllReservation]
    );

    const activeList = useMemo(
        () => reservationList.filter((r) => r.reservationStatus === "ACTIVE"),
        [reservationList]
    );

    const completedList = useMemo(
        () => reservationList.filter((r) => r.reservationStatus === "COMPLETED"),
        [reservationList]
    );

    const handleCheckout = useCallback((reservation) => {
        setConfirmModal({
            open: true,
            reservation,
            paymentMethod: "PAYOS",
            lostTicket: false,
        });
    }, []);

    const handleConfirm = useCallback(() => {
        const { reservation, paymentMethod, lostTicket } = confirmModal;
        if (!reservation) return;

        dispatch(
            createCheckoutRequest({
                ticketCode: reservation.ticketCode,
                paymentMethod,
                lostTicket,
            })
        );
        setConfirmModal({
            open: false,
            reservation: null,
            paymentMethod: "PAYOS",
            lostTicket: false,
        });
    }, [confirmModal, dispatch]);

    const handleCancelModal = useCallback(() => {
        setConfirmModal({
            open: false,
            reservation: null,
            paymentMethod: "PAYOS",
            lostTicket: false,
        });
    }, []);

    const renderSessionList = (list, actionRenderer) => {
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
                    <Empty description="No active sessions found" />
                </div>
            );
        }
        return (
            <div className="space-y-4">
                {list.map((r) => (
                    <SessionCard
                        key={r.reservationId}
                        r={r}
                        actions={actionRenderer ? actionRenderer(r) : null}
                    />
                ))}
            </div>
        );
    };

    const CheckoutTab = () => (
        <div>
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-orange-50 border border-orange-200 p-3">
                <AlertCircle size={16} className="text-orange-600 flex-shrink-0" />
                <p className="text-xs text-orange-700 font-medium">
                    Only <strong>ACTIVE</strong> sessions appear here. Vehicle must be checked in before checkout.
                </p>
            </div>
            {renderSessionList(activeList, (r) => (
                <button
                    type="button"
                    onClick={() => handleCheckout(r)}
                    className="flex items-center gap-1.5 rounded-lg bg-orange-600 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-orange-700 hover:shadow-md cursor-pointer active:scale-95"
                >
                    <LogOut size={14} />
                    Check Out
                </button>
            ))}
        </div>
    );

    const CompletedTab = () => (
        <div>
            {renderSessionList(completedList)}
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f0f4ff] p-4 md:p-8">
            <div className="mb-6 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
                <div className="mb-4">
                    <CommonBreadcrumb role="Staff" page="exit" />
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-200 bg-orange-50 text-orange-600">
                        <ArrowLeftSquare size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">
                            Vehicle Exit Management
                        </h1>
                        <p className="mt-1 font-medium text-slate-500">
                            Check out vehicles and complete parking sessions.
                        </p>
                    </div>
                </div>
            </div>

            <Tabs
                activeKey={mainTab}
                onChange={setMainTab}
                size="large"
                className="reservation-tabs"
                items={[
                    {
                        key: "checkout",
                        label: (
                            <span className="flex items-center gap-2 font-semibold">
                                <LogOut size={16} />
                                Check Out
                                {activeList.length > 0 && (
                                    <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 text-[10px] font-bold text-white">
                                        {activeList.length}
                                    </span>
                                )}
                            </span>
                        ),
                        children: <CheckoutTab />,
                    },
                    {
                        key: "completed",
                        label: (
                            <span className="flex items-center gap-2 font-semibold">
                                <ClipboardList size={16} />
                                Completed
                            </span>
                        ),
                        children: <CompletedTab />,
                    },
                ]}
            />

            <Modal
                open={confirmModal.open}
                onCancel={handleCancelModal}
                centered
                width={480}
                footer={null}
                destroyOnClose
            >
                {confirmModal.reservation && (
                    <div>
                        <div className="mb-5">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-white">
                                    <LogOut size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">
                                        Confirm Check Out
                                    </h3>
                                    <p className="text-sm text-slate-500">
                                        Are you sure you want to check out this vehicle?
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-3 mb-5">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-lg bg-white border border-slate-200 p-3">
                                    <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1">
                                        Reservation Code
                                    </p>
                                    <p className="text-sm font-bold font-mono text-violet-700">
                                        {confirmModal.reservation.reservationCode}
                                    </p>
                                </div>
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
                                    <p className="text-sm font-extrabold text-orange-600">
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
                            </div>
                        </div>

                        <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-3 mb-5">
                            <div>
                                <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1.5">
                                    Payment Method
                                </p>
                                <Select
                                    className="w-full"
                                    value={confirmModal.paymentMethod}
                                    options={PAYMENT_METHODS}
                                    onChange={(value) =>
                                        setConfirmModal((prev) => ({
                                            ...prev,
                                            paymentMethod: value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-semibold uppercase text-slate-400">
                                    Lost Ticket
                                </p>
                                <Switch
                                    checked={confirmModal.lostTicket}
                                    onChange={(checked) =>
                                        setConfirmModal((prev) => ({
                                            ...prev,
                                            lostTicket: checked,
                                        }))
                                    }
                                    checkedChildren="Yes"
                                    unCheckedChildren="No"
                                />
                            </div>
                        </div>

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
                                disabled={checkoutLoading}
                                className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-orange-600 hover:bg-orange-700 shadow-md shadow-orange-200"
                            >
                                {checkoutLoading && <Spin size="small" />}
                                <LogOut size={16} />
                                Confirm Check Out
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default VehicleExit;
