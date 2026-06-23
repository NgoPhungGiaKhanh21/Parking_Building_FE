import { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Spin, Tabs, Empty, Tag, Modal } from "antd";
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
  ArrowLeftSquare,
} from "lucide-react";
import dayjs from "dayjs";

import { getAllReservationRequest } from "../../../redux/staff/reservation/getAllReservation/getAllReservationSlice";
import CommonBreadcrumb from "../../../components/Commandbreadcrumb/Commandbreadcrumb";
import {
  createCheckoutRequest,
  resetCheckout,
} from "../../../redux/staff/parking_session/checkout/createCheckoutSlice";

const isCheckoutEligible = (r) => {
  if (!r?.ticketCode) return false;
  const status = r.reservationStatus;
  if (
    status === "COMPLETED" ||
    status === "CANCELLED" ||
    status === "EXPIRED"
  ) {
    return false;
  }
  return (
    status === "ACTIVE" ||
    status === "CONFIRMED" ||
    r.sessionStatus === "ACTIVE" ||
    (status === "APPROVED" && r.slotStatus === "OCCUPIED")
  );
};

const reservationStatusConfig = {
  PENDING: { color: "gold", icon: <Clock size={13} />, label: "Pending" },
  APPROVED: {
    color: "cyan",
    icon: <ShieldCheck size={13} />,
    label: "Approved",
  },
  ACTIVE: { color: "green", icon: <CheckCircle2 size={13} />, label: "Active" },
  CONFIRMED: {
    color: "blue",
    icon: <CheckCircle2 size={13} />,
    label: "Confirmed",
  },
  COMPLETED: {
    color: "default",
    icon: <CheckCircle2 size={13} />,
    label: "Completed",
  },
  CANCELLED: { color: "red", icon: <XCircle size={13} />, label: "Cancelled" },
  EXPIRED: { color: "default", icon: <XCircle size={13} />, label: "Expired" },
};

const formatCurrency = (value) =>
  value != null ? `${Number(value).toLocaleString("vi-VN")}đ` : "—";

const CheckoutResultDetail = ({ label, value }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-3">
    <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1">
      {label}
    </p>
    <p className="text-sm font-bold text-slate-800 break-all">{value ?? "—"}</p>
  </div>
);

const CheckoutResultModal = ({ open, result, onClose }) => {
  if (!result) return null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      centered
      width={560}
      footer={null}
      destroyOnHidden
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white">
          <CheckCircle2 size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">
            Check Out Successful
          </h3>
          <p className="text-sm text-slate-500">
            {result.message || "Vehicle checked out successfully."}
          </p>
        </div>
      </div>

      <div className="mb-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-5 text-white">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-200 mb-1">
          Total Fee
        </p>
        <p className="text-3xl font-black">{formatCurrency(result.totalFee)}</p>
        {result.checkoutTime && (
          <p className="text-xs text-emerald-200 mt-2">
            {dayjs(result.checkoutTime).format("DD/MM/YYYY HH:mm")}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <CheckoutResultDetail label="Slot" value={result.slotName} />
        <CheckoutResultDetail
          label="Location"
          value={[result.zoneName, result.floorName]
            .filter(Boolean)
            .join(" · ")}
        />
        <CheckoutResultDetail label="Building" value={result.buildingName} />
        <CheckoutResultDetail
          label="Vehicle Type"
          value={result.vehicleTypeName}
        />
        <CheckoutResultDetail
          label="Base Price"
          value={formatCurrency(result.basePrice)}
        />
        <CheckoutResultDetail
          label="Hourly Rate"
          value={formatCurrency(result.hourlyRate)}
        />
        <CheckoutResultDetail
          label="Parking Time"
          value={
            result.parkingHours != null || result.parkingMinutes != null
              ? `${result.parkingHours ?? 0}h ${result.parkingMinutes ?? 0}m`
              : "—"
          }
        />
        <CheckoutResultDetail label="Payment ID" value={result.paymentId} />
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {result.sessionStatus && (
          <Tag color="green">Session: {result.sessionStatus}</Tag>
        )}
        {result.paymentStatus && (
          <Tag color="blue">Payment: {result.paymentStatus}</Tag>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 cursor-pointer"
        >
          Done
        </button>
      </div>
    </Modal>
  );
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
          className="!text-xs !font-semibold !px-3 !py-1"
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
            Type
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
          <p className="text-xs font-semibold text-indigo-700 capitalize">
            {r.vehicleColor}
          </p>
        </div>
      </div>

      {r.reservationNote && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
          <MessageSquareText
            size={14}
            className="mt-0.5 shrink-0 text-amber-500"
          />
          <p className="text-xs text-amber-800">{r.reservationNote}</p>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3">
        {r.ticketCode && (
          <code className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-mono font-bold text-emerald-700">
            {r.ticketCode}
          </code>
        )}
        {r.reservationCode && (
          <code className="rounded bg-violet-50 px-2 py-0.5 text-xs font-mono font-bold text-violet-700">
            {r.reservationCode}
          </code>
        )}
        {actions && <div className="ml-auto">{actions}</div>}
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
  });

  const {
    getAllReservation,
    loading: reservationsLoading,
    error: reservationsError,
  } = useSelector((state) => state.getAllReservation);
  const {
    loading: checkoutLoading,
    error: checkoutError,
    checkoutResult,
  } = useSelector((state) => state.createCheckout);

  useEffect(() => {
    dispatch(getAllReservationRequest());
    return () => dispatch(resetCheckout());
  }, [dispatch]);

  const reservationList = useMemo(
    () => (Array.isArray(getAllReservation) ? getAllReservation : []),
    [getAllReservation],
  );

  const activeList = useMemo(
    () => reservationList.filter(isCheckoutEligible),
    [reservationList],
  );

  const completedList = useMemo(
    () => reservationList.filter((r) => r.reservationStatus === "COMPLETED"),
    [reservationList],
  );

  const handleCheckout = useCallback(
    (reservation) => {
      dispatch(resetCheckout());
      setConfirmModal({ open: true, reservation });
    },
    [dispatch],
  );

  const handleConfirm = useCallback(() => {
    if (checkoutLoading || !confirmModal.reservation) return;
    dispatch(
      createCheckoutRequest({
        ticketCode: confirmModal.reservation.ticketCode,
        paymentMethod: "PAYOS",
      }),
    );
  }, [checkoutLoading, confirmModal.reservation, dispatch]);

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
          <Empty description="No checked-in vehicles found" />
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

  return (
    <div className="min-h-screen bg-[#f0f4ff] p-4 md:p-8">
      <div className="mb-6 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
        <CommonBreadcrumb role="Staff" page="exit" />
        <div className="mt-4 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-200 bg-orange-50 text-orange-600">
            <ArrowLeftSquare size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Vehicle Exit Management
            </h1>
            <p className="text-slate-500">
              Check out vehicles and complete parking sessions.
            </p>
          </div>
        </div>
      </div>

      {reservationsError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {typeof reservationsError === "string"
            ? reservationsError
            : reservationsError?.message}
        </div>
      )}

      <Tabs
        activeKey={checkoutResult ? "completed" : mainTab}
        onChange={setMainTab}
        size="large"
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
            children: renderSessionList(activeList, (r) => (
              <button
                type="button"
                onClick={() => handleCheckout(r)}
                className="flex items-center gap-1.5 rounded-lg bg-orange-600 px-4 py-2 text-xs font-bold text-white hover:bg-orange-700 cursor-pointer"
              >
                <LogOut size={14} />
                Check Out
              </button>
            )),
          },
          {
            key: "completed",
            label: (
              <span className="flex items-center gap-2 font-semibold">
                <ClipboardList size={16} />
                Completed
              </span>
            ),
            children: renderSessionList(completedList),
          },
        ]}
      />

      <Modal
        open={confirmModal.open && !checkoutResult}
        onCancel={() => setConfirmModal({ open: false, reservation: null })}
        centered
        width={480}
        footer={null}
        destroyOnHidden
      >
        {confirmModal.reservation && (
          <div>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-white">
                <LogOut size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Confirm Check Out
                </h3>
                <p className="text-sm text-slate-500">
                  Scan ticket and complete checkout.
                </p>
              </div>
            </div>

            {checkoutError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {checkoutError}
              </div>
            )}

            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 mb-5 grid grid-cols-2 gap-3">
              <CheckoutResultDetail
                label="Ticket Code"
                value={confirmModal.reservation.ticketCode}
              />
              <CheckoutResultDetail
                label="Reservation"
                value={confirmModal.reservation.reservationCode}
              />
              <CheckoutResultDetail
                label="Driver"
                value={confirmModal.reservation.username}
              />
              <CheckoutResultDetail
                label="Slot"
                value={confirmModal.reservation.slotName}
              />
              <CheckoutResultDetail
                label="Plate"
                value={confirmModal.reservation.vehiclePlate}
              />
              <div className="rounded-lg border border-slate-200 bg-white p-3 flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase text-slate-400">
                  Payment
                </p>
                <Tag color="blue">PayOS</Tag>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setConfirmModal({ open: false, reservation: null })
                }
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={checkoutLoading}
                className="flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50 cursor-pointer"
              >
                {checkoutLoading && <Spin size="small" />}
                Confirm Check Out
              </button>
            </div>
          </div>
        )}
      </Modal>

      <CheckoutResultModal
        open={Boolean(checkoutResult)}
        result={checkoutResult}
        onClose={() => {
          dispatch(resetCheckout());
          setConfirmModal({ open: false, reservation: null });
        }}
      />
    </div>
  );
};

export default VehicleExit;
