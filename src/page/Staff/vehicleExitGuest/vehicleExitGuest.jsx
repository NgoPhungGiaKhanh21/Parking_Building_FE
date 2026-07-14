import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Spin, Tag, Upload, message, Input } from "antd";
import {
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
} from "lucide-react";
import dayjs from "dayjs";

import CommonBreadcrumb from "../../../components/Commandbreadcrumb/Commandbreadcrumb";
import {
  getSessionByPlateNumberRequest,
  getSessionByPlateNumberReset,
} from "../../../redux/staff/guest_parking/getSessionByPlateNumber/getSessionByPlateNumberSlice";
import {
  ocrPlateRequest,
  ocrPlateReset,
} from "../../../redux/staff/ocrPlate/ocrPlateSlice";
import {
  guestCheckoutOcrRequest,
  guestCheckoutOcrReset,
} from "../../../redux/staff/guest_parking/checkout_guest_ocr/guestCheckoutOcrSlice";
import { getAllPaymentsRequest } from "../../../redux/staff/payment/getAllPayments/getAllPaymentsSlice";
import {
  normalizeReservation,
  resolveImageUrl,
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

const VehicleExitGuest = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plateImageFileRef = useRef(null);

  // ── Form state
  const [plateImageUrl, setPlateImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [checkoutDone, setCheckoutDone] = useState(
    () => sessionStorage.getItem(GUEST_EXIT_CHECKOUT_DONE_KEY) === "true"
  );
  const [plateInput, setPlateInput] = useState("");

  // ── Redux selectors
  const { ocrPlate, loading: ocrLoading } = useSelector((s) => s.ocrPlate);
  const {
    getSessionByPlateNumber: session,
    loading: sessionLoading,
    error: sessionError,
  } = useSelector((s) => s.getSessionByPlateNumber);
  const {
    checkoutResult,
    loading: checkoutLoading,
    error: checkoutError,
  } = useSelector((s) => s.guestCheckoutOcr);
  const { payments } = useSelector((s) => s.getAllPayments);

  const showCheckout = searchParams.get("checkout") === "1";
  const isPaid = isGuestSessionPaid(session, payments);
  const amount = resolveGuestSessionAmount(session);

  // ── Derived values
  const recognizedPlate = useMemo(() => {
    if (!ocrPlate) return null;
    return ocrPlate?.data?.plateNumber || ocrPlate?.plateNumber || ocrPlate?.data || null;
  }, [ocrPlate]);

  const normalizedSession = useMemo(
    () => (session ? normalizeReservation(session) : null),
    [session]
  );

  // Initialize input when OCR finishes
  useEffect(() => {
    if (recognizedPlate) {
      setPlateInput(recognizedPlate);
    }
  }, [recognizedPlate]);

  // ── Debounced search session when plate changes
  useEffect(() => {
    if (!plateInput) return;
    const handler = setTimeout(() => {
      dispatch(getSessionByPlateNumberRequest({ plateNumber: plateInput }));
    }, 800);
    return () => clearTimeout(handler);
  }, [plateInput, dispatch]);

  // ── Load payments on mount + handle returning from PayOS
  useEffect(() => {
    dispatch(getAllPaymentsRequest());

    // If returning from PayOS payment success with checkout=1
    if (
      sessionStorage.getItem(GUEST_EXIT_CHECKOUT_DONE_KEY) !== "true" &&
      searchParams.get("checkout") === "1"
    ) {
      const storedPlate = sessionStorage.getItem(GUEST_EXIT_PLATE_KEY);
      if (storedPlate && !session) {
        dispatch(getSessionByPlateNumberRequest({ plateNumber: storedPlate }));
      }
    }

    return () => {
      dispatch(guestCheckoutOcrReset());
    };
  }, [dispatch]);

  // ── Handle checkout success
  useEffect(() => {
    if (!checkoutResult) return;
    setCheckoutDone(true);
    dispatch(getSessionByPlateNumberReset());
    sessionStorage.setItem(GUEST_EXIT_CHECKOUT_DONE_KEY, "true");
    sessionStorage.removeItem(GUEST_EXIT_PLATE_KEY);
    sessionStorage.removeItem(GUEST_EXIT_PAID_KEY);
    setPlateImageUrl("");
    plateImageFileRef.current = null;
    message.success(checkoutResult.message || "Guest vehicle checked out successfully.");
    navigate("/staff/guest-checkout", { replace: true });
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
        dispatch(guestCheckoutOcrReset());
        sessionStorage.removeItem(GUEST_EXIT_CHECKOUT_DONE_KEY);
        sessionStorage.removeItem(GUEST_EXIT_PAID_KEY);
        setCheckoutDone(false);
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
    if (!(isPaid && showCheckout)) {
      dispatch(ocrPlateReset());
      dispatch(getSessionByPlateNumberReset());
      dispatch(guestCheckoutOcrReset());
      setCheckoutDone(false);
    }
  }, [dispatch, isPaid, showCheckout]);

  // Navigate to payment page (keeps existing PayOS flow)
  const handleGoPayment = useCallback(() => {
    if (!session) return;
    sessionStorage.setItem(GUEST_EXIT_PLATE_KEY, session.vehiclePlate || plateInput || "");
    navigate("/staff/guest-checkout/payment");
  }, [navigate, session, plateInput]);

  // Confirm checkout using the new OCR checkout API
  const handleConfirmCheckout = useCallback(() => {
    if (!normalizedSession?.ticketCode) return;
    if (!plateImageFileRef.current) {
      message.error("Please upload a plate image before confirming.");
      return;
    }

    dispatch(
      guestCheckoutOcrRequest({
        plateImage: plateImageFileRef.current,
        ticketCode: normalizedSession.ticketCode,
        paymentMethod: "PAYOS",
        checkoutImage: plateImageFileRef.current, // Same image for both
      })
    );
  }, [normalizedSession, dispatch]);

  const handleResetAfterCheckout = useCallback(() => {
    dispatch(guestCheckoutOcrReset());
    dispatch(ocrPlateReset());
    dispatch(getSessionByPlateNumberReset());
    sessionStorage.removeItem(GUEST_EXIT_CHECKOUT_DONE_KEY);
    sessionStorage.removeItem(GUEST_EXIT_PLATE_KEY);
    sessionStorage.removeItem(GUEST_EXIT_PAID_KEY);
    setCheckoutDone(false);
    setPlateImageUrl("");
    setPlateInput("");
    plateImageFileRef.current = null;
    navigate("/staff/guest-checkout", { replace: true });
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
          <CommonBreadcrumb role="Staff" page="guest-checkout" />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 text-orange-600">
            <UserRound size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">
              Guest Vehicle Check-out
            </h1>
            <p className="mt-1 font-medium text-slate-500">
              Upload plate image → OCR reads plate → Find session → Payment → Check out.
            </p>
          </div>
        </div>
      </div>

      {/* ── Checkout Success Screen */}
      {checkoutDone && (
        <div className="rounded-2xl border border-emerald-100 bg-white p-8 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 size={36} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Check Out Successful</h3>
          <p className="text-slate-500 mb-6">Guest session completed. You can process the next vehicle.</p>
          <button
            type="button"
            onClick={handleResetAfterCheckout}
            className="rounded-xl bg-slate-800 px-6 py-2.5 text-sm font-bold text-white cursor-pointer hover:bg-slate-700 transition-colors"
          >
            New Guest Exit
          </button>
        </div>
      )}

      {/* ── Main Content (when not checkout done) */}
      {!checkoutDone && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Upload + Session Info */}
          <div className="lg:col-span-2 space-y-5">
            {/* Upload Plate Image Card */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-cyan-50 text-cyan-500 flex items-center justify-center">
                  <ImageIcon size={16} />
                </div>
                {isPaid && showCheckout ? "Upload Check-out Image" : "Upload Plate Image"}
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
                      <p className="text-xs text-emerald-600 mt-1">Please upload the check-out image.</p>
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
                {normalizedSession && !sessionLoading && (
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
            {sessionLoading && !session && (
              <div className="flex items-center justify-center py-8 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <Spin size="default" />
                <span className="ml-3 text-sm text-slate-500 font-medium">Finding session...</span>
              </div>
            )}

            {/* Session Error */}
            {sessionErrorMessage && !checkoutDone && !sessionLoading && (
              <div className="rounded-2xl border border-red-100 bg-red-50 p-5 shadow-sm">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle size={18} />
                  <span className="text-sm font-semibold">{sessionErrorMessage}</span>
                </div>
              </div>
            )}

            {/* Session Info Card */}
            {normalizedSession && !sessionLoading && (
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Ticket Code</p>
                    <p className="font-mono text-lg font-black text-emerald-700">
                      {normalizedSession.ticketCode}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Tag color="blue">{normalizedSession.vehicleTypeName || "Vehicle"}</Tag>
                    <Tag color={isPaid ? "green" : "gold"}>{isPaid ? "Paid" : "Unpaid"}</Tag>
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
                  { label: "Fee", value: normalizedSession ? formatCurrency(amount) : "—" },
                  {
                    label: "Duration",
                    value: normalizedSession?.checkinTime
                      ? `${Math.floor(dayjs().diff(dayjs(normalizedSession.checkinTime), "minute") / 60)}h ${dayjs().diff(dayjs(normalizedSession.checkinTime), "minute") % 60}m`
                      : "—",
                  },
                  { label: "Payment", value: isPaid ? "✓ Paid" : "✗ Unpaid", ok: isPaid },
                  { label: "Plate Image", value: plateImageUrl ? "✓ Uploaded" : "Not uploaded", ok: !!plateImageUrl },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-0">
                    <span className="text-slate-500">{item.label}:</span>
                    <span
                      className={`font-semibold ${item.mono ? "font-mono" : ""} ${
                        item.ok === true
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
                  { label: "Payment completed", ok: isPaid },
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
                {checkoutError}
              </div>
            )}

            {/* ── Action Buttons ── */}
            {normalizedSession && (
              <div className="space-y-3">
                {/* NOT PAID → Payment Button */}
                {!isPaid && (
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

                {/* PAID + checkout=1 → Confirm Checkout Button */}
                {isPaid && showCheckout && (
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
                    Confirm Check-out
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
                      onClick={() => navigate("/staff/guest-checkout?checkout=1")}
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
      )}
    </div>
  );
};

export default VehicleExitGuest;
