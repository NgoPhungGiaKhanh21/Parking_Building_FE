import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Spin, Tag, Upload, message, Input, Radio } from "antd";
import {
  Banknote,
  CheckCircle2,
  CreditCard,
  ImageIcon,
  LogOut,
  Upload as UploadIcon,
  UserRound,
  ScanLine,
  AlertCircle,
  MapPin,
  Car,
  Hash,
  Building2,
  User,
  Palette,
  Clock,
} from "lucide-react";
import dayjs from "dayjs";

import CommonBreadcrumb from "../../../components/Commandbreadcrumb/Commandbreadcrumb";
import {
  getSessionByPlateNumberRequest,
  getSessionByPlateNumberReset,
} from "../../../redux/staff/guest_parking/getSessionByPlateNumber/getSessionByPlateNumberSlice";
import { getAllReservationRequest } from "../../../redux/staff/reservation/getAllReservation/getAllReservationSlice";
import {
  ocrPlateRequest,
  ocrPlateReset,
} from "../../../redux/staff/ocrPlate/ocrPlateSlice";
import {
  unifiedCheckoutRequest,
  unifiedCheckoutReset,
} from "../../../redux/staff/parking_session/checkout/unifiedCheckoutSlice";
import { getAllPaymentsRequest } from "../../../redux/staff/payment/getAllPayments/getAllPaymentsSlice";
import {
  normalizeReservation,
  resolveImageUrl,
  formatParkingDurationLabel,
} from "../../../utils/reservationSessionUtils";
import {
  GUEST_EXIT_CHECKOUT_DONE_KEY,
  GUEST_EXIT_PAID_KEY,
  GUEST_EXIT_PLATE_KEY,
  isGuestSessionPaid,
  resolveGuestSessionAmount,
} from "../../../utils/guestExitUtils";

const formatCurrency = (value) =>
  value != null ? `${Number(value).toLocaleString("vi-VN")}đ` : "—";

const formatDateTime = (value) =>
  value ? dayjs(value).format("DD/MM/YYYY HH:mm") : "—";

const normalizePlate = (p) => (p || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

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

const VehicleExit = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plateImageFileRef = useRef(null);

  // ── Form state
  const [plateImageUrl, setPlateImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("PAYOS");
  const [checkoutDone, setCheckoutDone] = useState(
    () => sessionStorage.getItem(GUEST_EXIT_CHECKOUT_DONE_KEY) === "true"
  );
  const [plateInput, setPlateInput] = useState("");

  // ── Redux selectors
  const { ocrPlate, loading: ocrLoading } = useSelector((s) => s.ocrPlate);
  const {
    getAllReservation,
    loading: reservationsLoading,
  } = useSelector((state) => state.getAllReservation);
  const {
    getSessionByPlateNumber: guestSession,
    loading: sessionLoading,
    error: sessionError,
  } = useSelector((s) => s.getSessionByPlateNumber);
  const {
    checkoutResult,
    loading: checkoutLoading,
    error: checkoutError,
  } = useSelector((s) => s.unifiedCheckout);
  const { payments } = useSelector((s) => s.getAllPayments);

  const showCheckout = searchParams.get("checkout") === "1";

  // ── Derived values
  const recognizedPlate = useMemo(() => {
    if (!ocrPlate) return null;
    return ocrPlate?.data?.plateNumber || ocrPlate?.plateNumber || ocrPlate?.data || null;
  }, [ocrPlate]);

  // Reservation list processing
  const reservationList = useMemo(
    () => (Array.isArray(getAllReservation) ? getAllReservation : []),
    [getAllReservation]
  );
  const activeList = useMemo(
    () => reservationList.filter(isCheckoutEligible),
    [reservationList]
  );

  // Set plateInput when OCR returns
  useEffect(() => {
    if (recognizedPlate) {
      setPlateInput(recognizedPlate);
    }
  }, [recognizedPlate]);

  // Check if plate matches a driver reservation
  const driverReservation = useMemo(() => {
    if (!plateInput) return null;
    const norm = normalizePlate(plateInput);
    return activeList.find((r) => normalizePlate(r.vehiclePlate) === norm);
  }, [plateInput, activeList]);

  // Active session can be either Driver (from reservations) or Guest (from API)
  const activeSession = useMemo(() => {
    if (driverReservation) return driverReservation;
    if (guestSession) return guestSession;
    return null;
  }, [driverReservation, guestSession]);

  const normalizedSession = useMemo(
    () => (activeSession ? normalizeReservation(activeSession) : null),
    [activeSession]
  );

  const isPaid = isGuestSessionPaid(activeSession, payments);
  const isCashCheckout = !isPaid && paymentMethod === "CASH";
  const paymentReady = isPaid || isCashCheckout;
  const amount = resolveGuestSessionAmount(activeSession);
  const isDriver = !!driverReservation;
  const isGuest = !isDriver && !!guestSession;

  // ── Debounced search session for Guest when plate changes (if not found in Driver DB)
  useEffect(() => {
    if (!plateInput) return;
    if (driverReservation) return; // Skip API call if found in Driver DB

    const handler = setTimeout(() => {
      dispatch(getSessionByPlateNumberRequest({ plateNumber: plateInput }));
    }, 800);
    return () => clearTimeout(handler);
  }, [plateInput, driverReservation, dispatch]);

  // ── Load data on mount + handle returning from PayOS
  useEffect(() => {
    dispatch(getAllReservationRequest());
    dispatch(getAllPaymentsRequest());

    // If returning from PayOS payment success with checkout=1
    if (
      sessionStorage.getItem(GUEST_EXIT_CHECKOUT_DONE_KEY) !== "true" &&
      searchParams.get("checkout") === "1"
    ) {
      const storedPlate = sessionStorage.getItem(GUEST_EXIT_PLATE_KEY);
      if (storedPlate) {
        setPlateInput(storedPlate);
      }
      const storedImage = sessionStorage.getItem("GUEST_EXIT_IMAGE_DATA_URL");
      if (storedImage) {
        setPlateImageUrl(storedImage);
        fetch(storedImage)
          .then(res => res.blob())
          .then(blob => {
            plateImageFileRef.current = new File([blob], "checkout-image.jpg", { type: "image/jpeg" });
          })
          .catch(err => console.error("Failed to restore image", err));
      }
    }

    return () => {
      dispatch(unifiedCheckoutReset());
    };
  }, [dispatch]);

  // ── Handle checkout success
  useEffect(() => {
    if (!checkoutResult) return;
    message.success(checkoutResult.message || "Vehicle checked out successfully.");
    dispatch(unifiedCheckoutReset());
    dispatch(ocrPlateReset());
    dispatch(getSessionByPlateNumberReset());
    dispatch(getAllReservationRequest()); // Refresh reservations
    sessionStorage.removeItem(GUEST_EXIT_CHECKOUT_DONE_KEY);
    sessionStorage.removeItem(GUEST_EXIT_PLATE_KEY);
    sessionStorage.removeItem(GUEST_EXIT_PAID_KEY);
    sessionStorage.removeItem("GUEST_EXIT_IMAGE_DATA_URL");
    
    // Auto-reset form for next vehicle
    setCheckoutDone(false);
    setPlateImageUrl("");
    setPlateInput("");
    setPaymentMethod("PAYOS");
    if (plateImageFileRef?.current) plateImageFileRef.current = null;
    
    navigate("/staff/vehicle-exit", { replace: true });
  }, [checkoutResult, dispatch, navigate]);

  // ── Handlers
  const handleImageUpload = useCallback(
    async (options) => {
      const { file, onSuccess, onError } = options;
      setIsUploading(true);
      
      const isFinalCheckoutUpload = isPaid && showCheckout;

      if (!isFinalCheckoutUpload) {
        // Reset previous state
        dispatch(ocrPlateReset());
        dispatch(getSessionByPlateNumberReset());
        dispatch(unifiedCheckoutReset());
        sessionStorage.removeItem(GUEST_EXIT_CHECKOUT_DONE_KEY);
        sessionStorage.removeItem(GUEST_EXIT_PAID_KEY);
        sessionStorage.removeItem("GUEST_EXIT_IMAGE_DATA_URL");
        setCheckoutDone(false);
        setPaymentMethod("PAYOS");
      }

      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPlateImageUrl(e.target.result);
          setIsUploading(false);
          onSuccess("Ok");
        };
        reader.readAsDataURL(file);

        plateImageFileRef.current = file;

        if (!isFinalCheckoutUpload) {
          // Send to OCR API
          const formData = new FormData();
          formData.append("file", file);
          dispatch(ocrPlateRequest(formData));
        }
      } catch (err) {
        setIsUploading(false);
        onError(err);
        message.error("Failed to upload image");
      }
    },
    [dispatch, isPaid, showCheckout]
  );

  const handleRemoveImage = useCallback(() => {
    setPlateImageUrl("");
    plateImageFileRef.current = null;
    setPlateInput("");
    sessionStorage.removeItem("GUEST_EXIT_IMAGE_DATA_URL");
    if (!(isPaid && showCheckout)) {
      dispatch(ocrPlateReset());
      dispatch(getSessionByPlateNumberReset());
      dispatch(unifiedCheckoutReset());
      setCheckoutDone(false);
      setPaymentMethod("PAYOS");
    }
  }, [dispatch, isPaid, showCheckout]);

  // Navigate to payment page (keeps existing PayOS flow)
  const handleGoPayment = useCallback(() => {
    if (!activeSession) return;
    sessionStorage.setItem(GUEST_EXIT_PLATE_KEY, activeSession.vehiclePlate || plateInput || "");
    if (plateImageUrl) {
      sessionStorage.setItem("GUEST_EXIT_IMAGE_DATA_URL", plateImageUrl);
    }
    // Use the guest checkout payment page even for drivers if they need to pay
    navigate("/staff/vehicle-exit/payment");
  }, [navigate, activeSession, plateInput, plateImageUrl]);

  // Confirm checkout using the unified API
  const handleConfirmCheckout = useCallback(() => {
    if (!normalizedSession?.ticketCode) return;
    if (!plateImageFileRef.current) {
      message.error("Please upload a check-out image before confirming.");
      return;
    }

    dispatch(
      unifiedCheckoutRequest({
        ticketCode: normalizedSession.ticketCode,
        paymentMethod: (isCashCheckout || (!isPaid && isDriver)) ? "CASH" : "PAYOS",
        checkoutImage: plateImageFileRef.current, 
      })
    );
  }, [dispatch, isCashCheckout, isPaid, isDriver, normalizedSession]);

  const handleResetAfterCheckout = useCallback(() => {
    dispatch(unifiedCheckoutReset());
    dispatch(ocrPlateReset());
    dispatch(getSessionByPlateNumberReset());
    sessionStorage.removeItem(GUEST_EXIT_CHECKOUT_DONE_KEY);
    sessionStorage.removeItem(GUEST_EXIT_PLATE_KEY);
    sessionStorage.removeItem(GUEST_EXIT_PAID_KEY);
    sessionStorage.removeItem("GUEST_EXIT_IMAGE_DATA_URL");
    setCheckoutDone(false);
    setPlateImageUrl("");
    setPlateInput("");
    setPaymentMethod("PAYOS");
    plateImageFileRef.current = null;
    navigate("/staff/vehicle-exit", { replace: true });
  }, [dispatch, navigate]);

  const sessionErrorMessage =
    typeof sessionError === "string"
      ? sessionError
      : sessionError?.message || null;

  // ── Render
  return (
    <div className="min-h-screen bg-[#f0f4ff] p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <CommonBreadcrumb role="Staff" page="exit" />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 text-orange-600">
            <LogOut size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">
              Unified Vehicle Check-out
            </h1>
            <p className="mt-1 font-medium text-slate-500">
              OCR scanning auto-detects Drivers vs Guests. Find session → Payment → Check out.
            </p>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Upload + Session Info */}
          <div className="lg:col-span-2 space-y-5">
            {/* Upload Plate Image Card */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-cyan-50 text-cyan-500 flex items-center justify-center">
                  <ImageIcon size={16} />
                </div>
                {isPaid && showCheckout && !plateImageUrl ? "Upload Check-out Image" : "Upload Plate Image"}
                <span className="text-red-500">*</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Upload area */}
                <div>
                  <Upload
                    name="file"
                    listType="picture-card"
                    className="checkin-uploader"
                    showUploadList={false}
                    customRequest={handleImageUpload}
                    beforeUpload={(file) => {
                      const isImage = file.type.startsWith("image/");
                      if (!isImage) message.error("You can only upload image files!");
                      return isImage;
                    }}
                  >
                    {plateImageUrl ? (
                      <img src={plateImageUrl} alt="Plate" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                        {isUploading ? <Spin size="small" /> : <UploadIcon size={24} />}
                        <div className="text-xs font-medium">Click to Upload</div>
                      </div>
                    )}
                  </Upload>
                  {plateImageUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="mt-3 w-full rounded-lg border border-red-200 bg-red-50 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                    >
                      Remove Image
                    </button>
                  )}
                </div>

                {/* OCR Result */}
                <div className="flex flex-col justify-center">
                  {isPaid && showCheckout ? (
                    <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50 text-center">
                      <CheckCircle2 size={24} className="mx-auto text-emerald-500 mb-2" />
                      <p className="text-sm text-emerald-700 font-medium">Session & Payment Confirmed</p>
                      <p className="text-xs text-emerald-600 mt-1">
                        {plateImageUrl ? "Check-out image ready." : "Please upload the check-out image."}
                      </p>
                    </div>
                  ) : ocrLoading ? (
                    <div className="flex flex-col items-center justify-center p-6 rounded-xl border border-dashed border-blue-200 bg-blue-50">
                      <Spin size="default" />
                      <p className="mt-3 text-sm font-medium text-blue-600 animate-pulse">
                        <ScanLine size={16} className="inline mr-1" />
                        Reading plate number...
                      </p>
                    </div>
                  ) : plateInput || recognizedPlate ? (
                    <div className="p-5 rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 size={16} className="text-emerald-500" />
                        <span className="text-[10px] font-bold uppercase text-emerald-600 tracking-wide">
                          Recognized Plate
                        </span>
                      </div>
                      <div className="bg-white rounded-xl border-2 border-emerald-300 overflow-hidden text-center flex justify-center focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-200 transition-all">
                        <Input
                          value={plateInput}
                          onChange={(e) => setPlateInput(e.target.value.toUpperCase())}
                          variant="borderless"
                          className="text-2xl font-black font-mono tracking-[0.15em] text-slate-800 py-3 text-center w-full"
                          placeholder="ENTER PLATE"
                        />
                      </div>
                      <p className="mt-2 text-[10px] text-slate-400 text-center font-medium">Auto-searches after you stop typing</p>
                    </div>
                  ) : plateImageUrl && !ocrLoading ? (
                    <div className="p-5 rounded-xl border border-dashed border-amber-200 bg-amber-50 text-center">
                      <AlertCircle size={20} className="mx-auto text-amber-400 mb-2" />
                      <p className="text-sm text-amber-600 font-medium">Could not recognize plate.</p>
                    </div>
                  ) : (
                    <div className="p-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center">
                      <ScanLine size={28} className="mx-auto text-slate-300 mb-2" />
                      <p className="text-sm text-slate-400 font-medium">Upload plate image to start</p>
                    </div>
                  )}
                </div>

                {/* Check-in Image (Small, Right Side) */}
                {normalizedSession && !sessionLoading && !reservationsLoading && (
                  <div className="flex flex-col justify-center">
                    <p className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-1">
                      <ImageIcon size={14} className="text-blue-500" /> Check-in Image
                    </p>
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-2 h-full flex flex-col items-center justify-center min-h-[160px]">
                      {resolveImageUrl(normalizedSession.checkinImageUrl) ? (
                        <img
                          src={resolveImageUrl(normalizedSession.checkinImageUrl)}
                          alt="Check-in"
                          className="w-full h-full max-h-40 rounded-lg border border-slate-200 bg-white object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white text-slate-400 p-2 text-center">
                          <ImageIcon size={28} className="mb-2 opacity-40" />
                          <p className="text-xs font-medium leading-tight">No image<br/>available</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Session Loading */}
            {(sessionLoading || reservationsLoading) && !activeSession && (
              <div className="flex items-center justify-center py-8 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <Spin size="default" />
                <span className="ml-3 text-sm text-slate-500 font-medium">Finding session...</span>
              </div>
            )}

            {/* Session Error */}
            {sessionErrorMessage && !checkoutDone && !sessionLoading && !activeSession && (
              <div className="rounded-2xl border border-red-100 bg-red-50 p-5 shadow-sm">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle size={18} />
                  <span className="text-sm font-semibold">{sessionErrorMessage}</span>
                </div>
              </div>
            )}

            {/* Session Info Card */}
            {normalizedSession && !sessionLoading && (
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm relative overflow-hidden">
                {/* Driver/Guest Indicator */}
                <div
                  className={`absolute top-0 right-0 rounded-bl-2xl px-4 py-1 text-xs font-bold text-white shadow-sm ${
                    isDriver ? "bg-indigo-500" : "bg-orange-500"
                  }`}
                >
                  {isDriver ? "DRIVER SESSION" : "GUEST SESSION"}
                </div>

                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 mt-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Ticket Code</p>
                    <p className="font-mono text-lg font-black text-emerald-700">
                      {normalizedSession.ticketCode}
                    </p>
                  </div>
                  <div className="flex gap-2 mr-32">
                    <Tag color="blue">{normalizedSession.vehicleTypeName || "Vehicle"}</Tag>
                    <Tag color={isPaid ? "green" : isCashCheckout ? "cyan" : "gold"}>
                      {isPaid ? "Paid" : isCashCheckout ? "Cash Selected" : "Unpaid"}
                    </Tag>
                  </div>
                </div>

                {/* Fee banner */}
                <div className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 p-4 text-white mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-200">Estimated Fee</p>
                      <p className="text-2xl font-black">{formatCurrency(amount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-200">Check-in</p>
                      <p className="text-sm font-semibold">{formatDateTime(normalizedSession.checkinTime)}</p>
                    </div>
                  </div>
                </div>

                {/* Quick details grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                  {[
                    { icon: Hash, label: "Plate", value: normalizedSession.vehiclePlate },
                    { icon: MapPin, label: "Slot", value: normalizedSession.slotName },
                    {
                      icon: MapPin,
                      label: "Location",
                      value: [normalizedSession.zoneName, normalizedSession.floorName].filter(Boolean).join(" · "),
                    },
                    { icon: Car, label: "Building", value: normalizedSession.buildingName },
                  ].map((item, i) => (
                    <div key={i} className="rounded-lg border border-slate-100 bg-slate-50 p-2.5">
                      <p className="text-[9px] font-bold uppercase text-slate-400 flex items-center gap-1 mb-0.5">
                        <item.icon size={10} />
                        {item.label}
                      </p>
                      <p className="text-xs font-bold text-slate-700 truncate">{item.value || "—"}</p>
                    </div>
                  ))}
                </div>

                {/* Driver specific info */}
                {isDriver && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-2.5">
                      <p className="text-[9px] font-bold uppercase text-indigo-400 flex items-center gap-1 mb-0.5">
                        <User size={10} /> Driver Name
                      </p>
                      <p className="text-xs font-bold text-indigo-700 truncate">{normalizedSession.username || "—"}</p>
                    </div>
                    <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-2.5">
                      <p className="text-[9px] font-bold uppercase text-indigo-400 flex items-center gap-1 mb-0.5">
                        <Car size={10} /> Brand/Model
                      </p>
                      <p className="text-xs font-bold text-indigo-700 truncate">
                        {normalizedSession.vehicleBrand} {normalizedSession.vehicleModel}
                      </p>
                    </div>
                    <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-2.5">
                      <p className="text-[9px] font-bold uppercase text-indigo-400 flex items-center gap-1 mb-0.5">
                        <Palette size={10} /> Color
                      </p>
                      <p className="text-xs font-bold text-indigo-700 truncate">{normalizedSession.vehicleColor || "—"}</p>
                    </div>
                  </div>
                )}

                {/* Guest specific info */}
                {isGuest && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <div className="rounded-lg border border-orange-100 bg-orange-50 p-2.5">
                      <p className="text-[9px] font-bold uppercase text-orange-400 flex items-center gap-1 mb-0.5">
                        <Clock size={10} /> Parking Duration
                      </p>
                      <p className="text-xs font-bold text-orange-700 truncate">
                        {formatParkingDurationLabel(normalizedSession)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Summary + Actions */}
          <div className="space-y-5">
            {/* Summary card */}
            <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <LogOut size={16} /> Check-out Summary
              </h3>
              <div className="space-y-2 text-xs">
                {[
                  { label: "Plate Number", value: plateInput || normalizedSession?.vehiclePlate || "—", mono: true },
                  { label: "Ticket Code", value: normalizedSession?.ticketCode || "—", mono: true },
                  { label: "Mode", value: isDriver ? "DRIVER" : isGuest ? "GUEST" : "—", bold: true, color: isDriver ? "text-indigo-600" : isGuest ? "text-orange-600" : "text-slate-800" },
                  { label: "Fee", value: normalizedSession ? formatCurrency(amount) : "—" },
                  {
                    label: "Duration",
                    value: normalizedSession ? formatParkingDurationLabel(normalizedSession) : "—",
                  },
                  {
                    label: "Payment",
                    value: isPaid
                      ? "✓ Paid"
                      : isCashCheckout
                        ? "Cash at check-out"
                        : "✗ Unpaid",
                    ok: paymentReady,
                  },
                  { label: "Plate Image", value: plateImageUrl ? "✓ Uploaded" : "Not uploaded", ok: !!plateImageUrl },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-0">
                    <span className="text-slate-500">{item.label}:</span>
                    <span
                      className={`font-semibold ${item.mono ? "font-mono" : ""} ${item.bold ? "font-bold" : ""} ${
                        item.color ? item.color : item.ok === true
                          ? "text-emerald-600"
                          : item.ok === false
                            ? "text-red-500"
                            : "text-slate-800"
                      }`}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Readiness check */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <h3 className="text-xs font-bold uppercase text-slate-500 mb-3 tracking-wide">Readiness Check</h3>
              <div className="space-y-2">
                {[
                  { label: "Plate image uploaded", ok: !!plateImageUrl },
                  { label: "Plate identified", ok: !!plateInput },
                  { label: "Session found", ok: !!normalizedSession },
                  {
                    label: isCashCheckout
                      ? "Cash payment selected"
                      : "Payment completed",
                    ok: paymentReady,
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div
                      className={`h-4 w-4 rounded-full flex items-center justify-center ${
                        item.ok ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {item.ok ? <CheckCircle2 size={10} /> : <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />}
                    </div>
                    <span className={item.ok ? "text-slate-700 font-medium" : "text-slate-400"}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Checkout error */}
            {checkoutError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {typeof checkoutError === 'string' ? checkoutError : checkoutError?.message || "Failed to checkout"}
              </div>
            )}

            {/* ── Action Buttons ── */}
            {normalizedSession && (
              <div className="space-y-3">
                {!isPaid && (
                  <div className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Payment Method
                    </p>
                    {isDriver ? (
                      <div className="rounded-xl bg-orange-50 border border-orange-200 p-3 text-center">
                        <p className="text-sm font-bold text-orange-700 mb-1 flex items-center justify-center gap-2">
                          <Banknote size={18} /> Cash Only
                        </p>
                        <p className="text-xs text-orange-600">
                          Drivers paying at the gate must use cash. Online payments should be done via the Driver App.
                        </p>
                      </div>
                    ) : (
                      <>
                        <Radio.Group
                          value={paymentMethod}
                          onChange={(event) => setPaymentMethod(event.target.value)}
                          optionType="button"
                          buttonStyle="solid"
                          className="flex w-full"
                        >
                          <Radio.Button
                            value="PAYOS"
                            className="flex-1 text-center"
                          >
                            <span className="inline-flex items-center gap-2">
                              <CreditCard size={15} /> PayOS
                            </span>
                          </Radio.Button>
                          <Radio.Button
                            value="CASH"
                            className="flex-1 text-center"
                          >
                            <span className="inline-flex items-center gap-2">
                              <Banknote size={15} /> Cash
                            </span>
                          </Radio.Button>
                        </Radio.Group>
                        <p className="mt-3 text-xs text-slate-500">
                          {paymentMethod === "CASH"
                            ? "Collect cash and check out directly without opening the payment page."
                            : "Continue to PayOS to complete the online payment first."}
                        </p>
                      </>
                    )}
                  </div>
                )}

                {/* UNPAID + PAYOS → Payment page (Guests only) */}
                {!isPaid && !isDriver && paymentMethod === "PAYOS" && (
                  <button
                    type="button"
                    onClick={handleGoPayment}
                    className="w-full flex items-center justify-center gap-3 rounded-2xl py-4 text-lg font-bold text-white transition-all cursor-pointer active:scale-[0.98] shadow-lg"
                    style={{
                      background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
                      boxShadow: "0 8px 24px rgba(124,58,237,0.35)",
                    }}
                  >
                    <CreditCard size={22} />
                    Proceed to Payment
                  </button>
                )}

                {/* PAID after PayOS, or direct CASH → Confirm checkout */}
                {((isPaid && showCheckout) || isCashCheckout || (isDriver && !isPaid)) && (
                  <button
                    type="button"
                    onClick={handleConfirmCheckout}
                    disabled={checkoutLoading || !plateImageFileRef.current}
                    className="w-full flex items-center justify-center gap-3 rounded-2xl py-4 text-lg font-bold text-white transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    style={{
                      background:
                        plateImageFileRef.current
                          ? "linear-gradient(135deg, #f97316 0%, #ea580c 100%)"
                          : "#94a3b8",
                      boxShadow:
                        plateImageFileRef.current
                          ? "0 8px 24px rgba(249,115,22,0.35)"
                          : "none",
                    }}
                  >
                    {checkoutLoading && <Spin size="small" />}
                    <LogOut size={22} />
                    {(!isPaid && isDriver) || isCashCheckout
                      ? "Collect Cash & Check-out"
                      : "Confirm Check-out"}
                  </button>
                )}

                {/* PAID + NOT checkout=1 → Start Check Out Button */}
                {isPaid && !showCheckout && (
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <CheckCircle2 className="text-emerald-600" size={20} />
                      <div>
                        <p className="font-bold text-emerald-800 text-sm">Payment completed</p>
                        <p className="text-xs text-emerald-600">
                          Upload plate image (if not done) and proceed to check out.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate("/staff/vehicle-exit?checkout=1")}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white hover:bg-orange-700 cursor-pointer transition-colors"
                    >
                      <LogOut size={16} />
                      Start Check Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
      </div>
    </div>
  );
};

export default VehicleExit;
