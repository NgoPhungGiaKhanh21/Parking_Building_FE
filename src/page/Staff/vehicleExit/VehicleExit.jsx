import { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Spin, Tabs, Empty, Tag, Modal, Upload, message } from "antd";
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
  ImageIcon,
  Upload as UploadIcon,
} from "lucide-react";
import dayjs from "dayjs";

import { getAllReservationRequest } from "../../../redux/staff/reservation/getAllReservation/getAllReservationSlice";
import CommonBreadcrumb from "../../../components/Commandbreadcrumb/Commandbreadcrumb";
import {
  createCheckoutRequest,
  resetCheckout,
} from "../../../redux/staff/parking_session/checkout/createCheckoutSlice";
import { getAllPaymentsRequest } from "../../../redux/staff/payment/getAllPayments/getAllPaymentsSlice";
import {
  normalizeReservation,
  mergeCheckoutSession,
  recordsMatch,
  formatParkingDurationLabel,
} from "../../../utils/reservationSessionUtils";

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
    status === "CHECKED_IN" ||
    status === "ACTIVE" ||
    status === "CONFIRMED" ||
    r.sessionStatus === "ACTIVE" ||
    (status === "APPROVED" && r.slotStatus === "OCCUPIED")
  );
};

const reservationStatusConfig = {
  PENDING: { color: "gold", icon: <Clock size={13} />, label: "Pending" },
  CHECKED_IN: {
    color: "blue",
    icon: <ShieldCheck size={13} />,
    label: "Checked In",
  },
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

const formatDateTime = (value) =>
  value ? dayjs(value).format("DD/MM/YYYY HH:mm") : "—";

const normalizeStatus = (value) =>
  String(value || "")
    .trim()
    .toUpperCase();

const SessionImagePanel = ({ label, src, emptyText = "No image" }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
    <p className="text-xs font-semibold uppercase text-slate-500 mb-2 flex items-center gap-1.5">
      <ImageIcon size={14} />
      {label}
    </p>
    {src ? (
      <img
        src={src}
        alt={label}
        className="w-full h-52 object-contain rounded-lg border border-slate-200 bg-white"
      />
    ) : (
      <div className="flex h-52 w-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white text-xs text-slate-400">
        {emptyText}
      </div>
    )}
  </div>
);

const CheckoutResultDetail = ({ label, value }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-3">
    <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1">
      {label}
    </p>
    <p className="text-sm font-bold text-slate-800 break-all">{value ?? "—"}</p>
  </div>
);

const CheckoutResultModal = ({ open, result, source, onClose }) => {
  if (!result) return null;
  const merged = mergeCheckoutSession(source, result);

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
        <p className="text-3xl font-black">{formatCurrency(merged.totalFee)}</p>
        {merged.checkoutTime && (
          <p className="text-xs text-emerald-200 mt-2">
            {formatDateTime(merged.checkoutTime)}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <CheckoutResultDetail label="Check-in Time" value={formatDateTime(merged.checkinTime)} />
        <CheckoutResultDetail label="Check-out Time" value={formatDateTime(merged.checkoutTime)} />
        <CheckoutResultDetail label="Slot" value={merged.slotName} />
        <CheckoutResultDetail
          label="Location"
          value={[merged.zoneName, merged.floorName]
            .filter(Boolean)
            .join(" · ")}
        />
        <CheckoutResultDetail label="Building" value={merged.buildingName} />
        <CheckoutResultDetail
          label="Vehicle Type"
          value={merged.vehicleTypeName}
        />
        <CheckoutResultDetail
          label="Parking Time"
          value={formatParkingDurationLabel(merged)}
        />
      </div>

      <div className="flex flex-col gap-3 mb-4">
        <SessionImagePanel label="Check-in Image" src={merged.checkinImageUrl} />
        <SessionImagePanel label="Check-out Image" src={merged.checkoutImageUrl} />
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {merged.sessionStatus && (
          <Tag color="green">Session: {merged.sessionStatus}</Tag>
        )}
        {merged.paymentStatus && (
          <Tag color="blue">Payment: {merged.paymentStatus}</Tag>
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

const SessionCard = ({ r, actions, completed = false }) => {
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
            Reservation Start
          </p>
          <p className="text-xs font-semibold text-slate-700">
            {formatDateTime(r.checkinTime ?? r.reservationStart)}
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-[10px] font-bold uppercase text-slate-400 mb-0.5">
            {!completed && r.paymentTime ? "Payment Time" : "Reservation End"}
          </p>
          <p className="text-xs font-semibold text-slate-700">
            {!completed && r.paymentTime
              ? formatDateTime(r.paymentTime)
              : formatDateTime(r.checkoutTime ?? r.reservationEnd)}
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-[10px] font-bold uppercase text-slate-400 mb-0.5">
            Type
          </p>
          <p className="text-xs font-semibold text-slate-700">
            {r.floorVehicleTypeName ?? r.vehicleTypeName}
          </p>
        </div>
      </div>

      {completed && (
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3">
            <p className="text-[10px] font-bold uppercase text-emerald-500 mb-0.5">
              Check-in Time
            </p>
            <p className="text-xs font-semibold text-emerald-800">
              {formatDateTime(r.checkinTime)}
            </p>
          </div>
          <div className="rounded-lg bg-orange-50 border border-orange-100 p-3">
            <p className="text-[10px] font-bold uppercase text-orange-500 mb-0.5">
              Check-out Time
            </p>
            <p className="text-xs font-semibold text-orange-800">
              {formatDateTime(r.checkoutTime)}
            </p>
          </div>
          <div className="rounded-lg bg-violet-50 border border-violet-100 p-3">
            <p className="text-[10px] font-bold uppercase text-violet-500 mb-0.5">
              Total Fee
            </p>
            <p className="text-xs font-bold text-violet-800">
              {formatCurrency(r.totalFee)}
            </p>
          </div>
          <div className="rounded-lg bg-blue-50 border border-blue-100 p-3">
            <p className="text-[10px] font-bold uppercase text-blue-500 mb-0.5">
              Parking Duration
            </p>
            <p className="text-xs font-semibold text-blue-800">
              {formatParkingDurationLabel(r)}
            </p>
          </div>
        </div>
      )}

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

      {completed && (
        <div className="mt-3 flex flex-col gap-3">
          <SessionImagePanel label="Check-in Image" src={r.checkinImageUrl} />
          <SessionImagePanel label="Check-out Image" src={r.checkoutImageUrl} />
        </div>
      )}

      {!completed && r.checkinImageUrl && (
        <div className="mt-3">
          <SessionImagePanel label="Check-in Image" src={r.checkinImageUrl} />
        </div>
      )}

      {completed && (r.paymentStatus || r.sessionStatus) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {r.sessionStatus && <Tag color="green">Session: {r.sessionStatus}</Tag>}
          {r.paymentStatus && <Tag color="blue">Payment: {r.paymentStatus}</Tag>}
        </div>
      )}

      {(r.reservationNote || r.note) && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
          <MessageSquareText
            size={14}
            className="mt-0.5 shrink-0 text-amber-500"
          />
          <p className="text-xs text-amber-800">{r.reservationNote ?? r.note}</p>
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
  const [checkoutImageUrl, setCheckoutImageUrl] = useState("");
  const [checkoutImageFile, setCheckoutImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [checkoutSource, setCheckoutSource] = useState(null);
  const [sessionOverlays, setSessionOverlays] = useState({});

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
  const { payments: allPayments } = useSelector((state) => state.getAllPayments);

  useEffect(() => {
    dispatch(getAllReservationRequest());
    dispatch(getAllPaymentsRequest());
    return () => dispatch(resetCheckout());
  }, [dispatch]);

  const reservationList = useMemo(
    () => (Array.isArray(getAllReservation) ? getAllReservation : []),
    [getAllReservation],
  );

  const mergedCheckoutResult = useMemo(
    () =>
      checkoutResult
        ? mergeCheckoutSession(checkoutSource, checkoutResult, checkoutImageUrl)
        : null,
    [checkoutResult, checkoutSource, checkoutImageUrl],
  );

  const resolveRecord = useCallback(
    (record) => {
      const base = normalizeReservation(record);
      if (mergedCheckoutResult && recordsMatch(base, mergedCheckoutResult)) {
        return mergeCheckoutSession(base, mergedCheckoutResult);
      }
      const overlay = Object.values(sessionOverlays).find((item) =>
        recordsMatch(base, item),
      );
      return overlay ? mergeCheckoutSession(base, overlay) : base;
    },
    [mergedCheckoutResult, sessionOverlays],
  );

  const activeList = useMemo(
    () =>
      reservationList
        .filter(isCheckoutEligible)
        .map(resolveRecord)
        .sort((a, b) => {
          const aTime = a.paymentTime
            ? dayjs(a.paymentTime).valueOf()
            : Number.POSITIVE_INFINITY;
          const bTime = b.paymentTime
            ? dayjs(b.paymentTime).valueOf()
            : Number.POSITIVE_INFINITY;
          return aTime - bTime;
        }),
    [reservationList, resolveRecord],
  );

  const completedList = useMemo(
    () =>
      reservationList
        .filter((r) => r.reservationStatus === "COMPLETED")
        .map(resolveRecord)
        .sort((a, b) => {
          const aTime = a.checkoutTime ? dayjs(a.checkoutTime).valueOf() : 0;
          const bTime = b.checkoutTime ? dayjs(b.checkoutTime).valueOf() : 0;
          return bTime - aTime;
        }),
    [reservationList, resolveRecord],
  );

  const earliestCheckoutRecord = useMemo(
    () => (activeList.length > 0 ? activeList[0] : null),
    [activeList],
  );

  const canCheckoutRecord = useCallback(
    (record) => {
      if (!earliestCheckoutRecord) return true;
      return recordsMatch(record, earliestCheckoutRecord);
    },
    [earliestCheckoutRecord],
  );

  const handleCheckout = useCallback(
    (reservation) => {
      dispatch(resetCheckout());
      const normalized = normalizeReservation(reservation);
      setCheckoutImageUrl("");
      setCheckoutImageFile(null);
      setIsUploading(false);
      setCheckoutSource(normalized);
      setConfirmModal({ open: true, reservation: normalized });
    },
    [dispatch],
  );

  const persistCheckoutOverlay = useCallback((merged) => {
    if (!merged) return;
    setSessionOverlays((prev) => {
      const next = { ...prev };
      const keys = [merged.ticketCode, merged.sessionId, merged.reservationId].filter(
        Boolean,
      );
      keys.forEach((key) => {
        next[key] = merged;
      });
      return next;
    });
  }, []);

  const handleCloseConfirm = useCallback(() => {
    setConfirmModal({ open: false, reservation: null });
    setCheckoutImageUrl("");
    setCheckoutImageFile(null);
    setIsUploading(false);
  }, []);

  const handleConfirm = useCallback(() => {
    if (checkoutLoading || !confirmModal.reservation) return;
    if (!checkoutImageFile) {
      message.error("Please upload check-out image before confirming.");
      return;
    }
    dispatch(
      createCheckoutRequest({
        ticketCode: confirmModal.reservation.ticketCode,
        paymentMethod: "PAYOS",
        checkoutImage: checkoutImageFile,
      }),
    );
  }, [checkoutLoading, checkoutImageFile, confirmModal.reservation, dispatch]);

  const resolvedConfirmAmount = useMemo(() => {
    const reservation = confirmModal.reservation;
    if (!reservation) return null;

    const list = Array.isArray(allPayments) ? allPayments : [];
    const paidMatch = [...list]
      .filter((p) => {
        const bySession =
          reservation.sessionId &&
          p.sessionId &&
          String(p.sessionId) === String(reservation.sessionId);
        const byTicket =
          reservation.ticketCode &&
          p.ticketCode &&
          String(p.ticketCode) === String(reservation.ticketCode);
        if (!bySession && !byTicket) return false;

        const paidStatus = normalizeStatus(p.paidStatus);
        const paymentStatus = normalizeStatus(p.paymentStatus);
        return (
          paidStatus === "PAID" ||
          paymentStatus === "PAID" ||
          paymentStatus === "CONFIRMED"
        );
      })
      .sort((a, b) => {
        const aTime = dayjs(a.paymentTime || a.createdAt || 0).valueOf();
        const bTime = dayjs(b.paymentTime || b.createdAt || 0).valueOf();
        return bTime - aTime;
      })[0];

    if (paidMatch?.amount != null) return paidMatch.amount;
    return reservation.totalFee ?? null;
  }, [confirmModal.reservation, allPayments]);

  const renderSessionList = (list, actionRenderer, completed = false) => {
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
          <Empty
            description={
              completed
                ? "No completed sessions found"
                : "No checked-in vehicles found"
            }
          />
        </div>
      );
    }
    return (
      <div className="space-y-4">
        {list.map((r, index) => (
          <SessionCard
            key={r.reservationId}
            r={r}
            completed={completed}
            actions={actionRenderer ? actionRenderer(r, index, list) : null}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f0f4ff] p-4 md:p-8">
      <div className="mb-6 rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <CommonBreadcrumb role="Staff" page="exit" />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 text-orange-600">
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
                onClick={() => {
                  if (!canCheckoutRecord(r)) {
                    message.warning(
                      "Please check out the earliest paid vehicle first.",
                    );
                    return;
                  }
                  handleCheckout(r);
                }}
                disabled={!canCheckoutRecord(r)}
                className="flex items-center gap-1.5 rounded-lg bg-orange-600 px-4 py-2 text-xs font-bold text-white hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
            children: renderSessionList(completedList, null, true),
          },
        ]}
      />

      <Modal
        open={confirmModal.open && !checkoutResult}
        onCancel={handleCloseConfirm}
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

            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 mb-4 grid grid-cols-2 gap-3">
              <CheckoutResultDetail
                label="Driver"
                value={confirmModal.reservation.username}
              />
              <CheckoutResultDetail
                label="Building"
                value={confirmModal.reservation.buildingName}
              />
              <CheckoutResultDetail
                label="Slot"
                value={confirmModal.reservation.slotName}
              />
              <CheckoutResultDetail
                label="Vehicle Type"
                value={
                  confirmModal.reservation.vehicleTypeName ??
                  confirmModal.reservation.floorVehicleTypeName
                }
              />
              <CheckoutResultDetail
                label="Plate"
                value={confirmModal.reservation.vehiclePlate}
              />
              <CheckoutResultDetail
                label="Check-in Time"
                value={formatDateTime(confirmModal.reservation.checkinTime)}
              />
              <CheckoutResultDetail
                label="Total Fee"
                value={formatCurrency(resolvedConfirmAmount)}
              />
              <div className="rounded-lg border border-slate-200 bg-white p-3 flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase text-slate-400">
                  Payment
                </p>
                <Tag color="blue">PayOS</Tag>
              </div>
            </div>

            <div className="rounded-xl bg-white border border-slate-200 p-4 mb-5">
              <p className="text-xs font-semibold uppercase text-slate-500 mb-3">
                Session Images
              </p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SessionImagePanel
                  label="Check-in Image"
                  src={confirmModal.reservation.checkinImageUrl}
                />

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase text-slate-500 mb-2 flex items-center gap-1.5">
                    <UploadIcon size={14} />
                    Check-out Image <span className="text-red-500">*</span>
                  </p>
                  <Upload
                    name="file"
                    className="checkout-uploader w-full"
                    showUploadList={false}
                    customRequest={({ file, onSuccess, onError }) => {
                      setIsUploading(true);
                      try {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          setCheckoutImageUrl(e.target.result);
                          setCheckoutImageFile(file);
                          setIsUploading(false);
                          onSuccess("Ok");
                          message.success("Check-out image added");
                        };
                        reader.onerror = () => {
                          setIsUploading(false);
                          onError(new Error("Failed to read image"));
                          message.error("Failed to add image");
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
                    {checkoutImageUrl ? (
                      <img
                        src={checkoutImageUrl}
                        alt="Vehicle Check-out"
                        className="w-full h-56 object-contain rounded-xl border border-slate-200 bg-white p-1"
                      />
                    ) : (
                      <div className="flex h-56 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white text-slate-400 gap-2 transition-colors hover:border-orange-300 hover:bg-orange-50/30">
                        {isUploading ? <Spin size="small" /> : <UploadIcon size={22} />}
                        <div className="text-xs font-semibold">Click to Upload</div>
                        <div className="text-[11px] text-slate-400">JPG, PNG, WEBP</div>
                      </div>
                    )}
                  </Upload>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseConfirm}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={checkoutLoading || isUploading || !checkoutImageFile}
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
        open={Boolean(mergedCheckoutResult)}
        result={mergedCheckoutResult}
        source={checkoutSource}
        onClose={() => {
          persistCheckoutOverlay(mergedCheckoutResult);
          dispatch(resetCheckout());
          setConfirmModal({ open: false, reservation: null });
          setCheckoutSource(null);
          setCheckoutImageUrl("");
          setCheckoutImageFile(null);
          setIsUploading(false);
        }}
      />
    </div>
  );
};

export default VehicleExit;
