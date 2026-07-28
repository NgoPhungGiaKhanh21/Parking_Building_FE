import { useCallback, useEffect, useLayoutEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Spin, message } from "antd";
import { AlertCircle } from "lucide-react";

import {
  plateLookupRequest,
  plateLookupReset,
} from "../../../redux/staff/parking_session/plateLookup/plateLookupSlice";
import { getStaffBuildingRequest } from "../../../redux/staff/guest_parking/getStaffBuilding/getStaffBuildingSlice";
import { ocrPlateRequest, ocrPlateReset } from "../../../redux/staff/ocrPlate/ocrPlateSlice";
import {
  unifiedCheckoutRequest,
  unifiedCheckoutReset,
} from "../../../redux/staff/parking_session/checkout/unifiedCheckoutSlice";
import { getAllPaymentsRequest } from "../../../redux/staff/payment/getAllPayments/getAllPaymentsSlice";
import { normalizeReservation } from "../../../utils/reservationSessionUtils";
import { normalizePlate } from "../../../utils/plateUtils";
import {
  enrichCheckoutSession,
  isCheckedInReservationLookup,
  isWalkInDriverLookup,
} from "../../../utils/plateLookupUtils";
import {
  isDriverWalkInSession,
  readWalkInDriverCache,
  mergeDriverInfo,
} from "../../../utils/walkInSessionUtils";
import {
  GUEST_EXIT_CHECKOUT_DONE_KEY,
  GUEST_EXIT_PAID_KEY,
  GUEST_EXIT_PLATE_KEY,
  isGuestSessionPaid,
  resolveGuestSessionAmount,
} from "../../../utils/guestExitUtils";
import { setStaffExitMounted } from "../../../utils/staffVehiclePageGuard";
import { resolveExitCheckMode } from "../shared/checkModeTheme";

import ExitHeader from "./components/ExitHeader";
import ExitPlateUploadCard from "./components/ExitPlateUploadCard";
import ExitSessionInfoCard from "./components/ExitSessionInfoCard";
import ExitCheckoutSummary, { ExitReadinessCheck } from "./components/ExitCheckoutSummary";
import ExitCheckoutActions from "./components/ExitCheckoutActions";

const VehicleExit = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plateImageFileRef = useRef(null);
  const isActiveRef = useRef(true);
  const skipUnmountCleanupRef = useRef(false);

  const [plateImageUrl, setPlateImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("PAYOS");
  const [checkoutDone, setCheckoutDone] = useState(
    () => sessionStorage.getItem(GUEST_EXIT_CHECKOUT_DONE_KEY) === "true",
  );
  const [plateInput, setPlateInput] = useState("");

  const { ocrPlate, loading: ocrLoading } = useSelector((s) => s.ocrPlate);
  const { getStaffBuilding: staffBuilding } = useSelector((s) => s.getStaffBuilding);
  const { result: plateLookup, loading: lookupLoading, error: lookupError } = useSelector(
    (s) => s.plateLookup,
  );
  const {
    checkoutResult,
    loading: checkoutLoading,
    error: checkoutError,
  } = useSelector((s) => s.unifiedCheckout);
  const { payments } = useSelector((s) => s.getAllPayments);

  const showCheckout = searchParams.get("checkout") === "1";

  const buildingId = useMemo(() => {
    if (!staffBuilding) return null;
    if (Array.isArray(staffBuilding) && staffBuilding.length > 0) {
      return staffBuilding[0]?.buildingId || staffBuilding[0]?.id || null;
    }
    return staffBuilding?.buildingId || staffBuilding?.id || null;
  }, [staffBuilding]);

  const recognizedPlate = useMemo(() => {
    if (!ocrPlate) return null;
    return ocrPlate?.data?.plateNumber || ocrPlate?.plateNumber || ocrPlate?.data || null;
  }, [ocrPlate]);

  useEffect(() => {
    if (!isActiveRef.current || !recognizedPlate || !plateImageUrl) return;
    setPlateInput(recognizedPlate);
  }, [recognizedPlate, plateImageUrl]);

  const checkoutSession = useMemo(
    () => (plateLookup ? enrichCheckoutSession(plateLookup) : null),
    [plateLookup],
  );

  const driverReservation = useMemo(() => {
    if (!isCheckedInReservationLookup(plateLookup)) return null;
    return plateLookup.reservation;
  }, [plateLookup]);

  const isDriverReserved = Boolean(driverReservation);
  const isDriverWalkIn = useMemo(() => {
    if (isDriverReserved || !checkoutSession) return false;
    if (isWalkInDriverLookup(plateLookup)) return true;
    return isDriverWalkInSession(checkoutSession, plateLookup);
  }, [isDriverReserved, checkoutSession, plateLookup]);

  const activeSession = checkoutSession;

  const normalizedSession = useMemo(() => {
    if (!activeSession) return null;
    const base = normalizeReservation(activeSession);
    const plate = base.vehiclePlate || plateInput;
    const cached = readWalkInDriverCache(plate, base.ticketCode);
    const fromLookup = plateLookup?.vehicle;
    const fromPayment = (Array.isArray(payments) ? payments : []).find(
      (p) =>
        (base.sessionId && p.sessionId && String(p.sessionId) === String(base.sessionId)) ||
        (base.ticketCode && p.ticketCode && p.ticketCode === base.ticketCode),
    );
    return mergeDriverInfo(base, {
      driverUsername:
        cached?.driverUsername ||
        fromLookup?.username ||
        fromLookup?.driverUsername,
      driverFullName:
        cached?.driverFullName ||
        fromLookup?.driverFullName ||
        fromPayment?.driverName ||
        fromPayment?.fullName,
    });
  }, [activeSession, plateInput, plateLookup, payments]);

  const isPaid = isGuestSessionPaid(activeSession, payments);
  const isCashCheckout = !isPaid && paymentMethod === "CASH";
  const isDriver = isDriverReserved || isDriverWalkIn;
  const isGuest = Boolean(checkoutSession) && !isDriver;
  const isDriverCashAtGate = isDriver && !isPaid;
  const paymentReady = isPaid || isCashCheckout || isDriverCashAtGate;
  const amount = resolveGuestSessionAmount(activeSession);
  const checkMode = resolveExitCheckMode({ isDriverWalkIn, isDriver, isGuest });

  useLayoutEffect(() => {
    return () => {
      if (skipUnmountCleanupRef.current) return;
      isActiveRef.current = false;
      setStaffExitMounted(false);
      dispatch(ocrPlateReset());
      dispatch(plateLookupReset());
      dispatch(unifiedCheckoutReset());
    };
  }, [dispatch]);

  useEffect(() => {
    if (!isActiveRef.current || !plateInput) return;

    const handler = setTimeout(() => {
      if (!isActiveRef.current) return;
      dispatch(
        plateLookupRequest({
          plateNumber: normalizePlate(plateInput),
          buildingId,
          silent: true,
        }),
      );
    }, 800);

    return () => clearTimeout(handler);
  }, [plateInput, buildingId, dispatch]);

  useLayoutEffect(() => {
    isActiveRef.current = true;
    setStaffExitMounted(true);
    skipUnmountCleanupRef.current = false;

    const isPayOsReturn =
      sessionStorage.getItem(GUEST_EXIT_CHECKOUT_DONE_KEY) !== "true" &&
      searchParams.get("checkout") === "1";

    if (!isPayOsReturn) {
      dispatch(ocrPlateReset());
      dispatch(plateLookupReset());
      dispatch(unifiedCheckoutReset());
      setPlateInput("");
      setPlateImageUrl("");
      setPaymentMethod("PAYOS");
      setCheckoutDone(false);
      plateImageFileRef.current = null;
    }
  }, [dispatch, searchParams]);

  useEffect(() => {
    isActiveRef.current = true;
    setStaffExitMounted(true);

    const isPayOsReturn =
      sessionStorage.getItem(GUEST_EXIT_CHECKOUT_DONE_KEY) !== "true" &&
      searchParams.get("checkout") === "1";

    dispatch(getStaffBuildingRequest());
    dispatch(getAllPaymentsRequest());

    if (isPayOsReturn) {
      const storedPlate = sessionStorage.getItem(GUEST_EXIT_PLATE_KEY);
      if (storedPlate) setPlateInput(storedPlate);
      const storedImage = sessionStorage.getItem("GUEST_EXIT_IMAGE_DATA_URL");
      if (storedImage) {
        setPlateImageUrl(storedImage);
        fetch(storedImage)
          .then((res) => res.blob())
          .then((blob) => {
            if (!isActiveRef.current) return;
            plateImageFileRef.current = new File([blob], "checkout-image.jpg", {
              type: "image/jpeg",
            });
          })
          .catch((err) => console.error("Failed to restore image", err));
      }
    }

    return () => {
      isActiveRef.current = false;
      setStaffExitMounted(false);
      if (skipUnmountCleanupRef.current) return;
      dispatch(ocrPlateReset());
      dispatch(plateLookupReset());
      dispatch(unifiedCheckoutReset());
      sessionStorage.removeItem(GUEST_EXIT_CHECKOUT_DONE_KEY);
      sessionStorage.removeItem(GUEST_EXIT_PLATE_KEY);
      sessionStorage.removeItem(GUEST_EXIT_PAID_KEY);
      sessionStorage.removeItem("GUEST_EXIT_IMAGE_DATA_URL");
    };
  }, [dispatch, searchParams]);

  useEffect(() => {
    if (!isActiveRef.current || !checkoutResult) return;
    message.success(checkoutResult.message || "Vehicle checked out successfully.");
    dispatch(unifiedCheckoutReset());
    dispatch(ocrPlateReset());
    dispatch(plateLookupReset());
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
  }, [checkoutResult, dispatch, navigate]);

  const handleImageUpload = useCallback(
    async (options) => {
      const { file, onSuccess, onError } = options;
      setIsUploading(true);
      const isFinalCheckoutUpload = isPaid && showCheckout;

      if (!isFinalCheckoutUpload) {
        dispatch(ocrPlateReset());
        dispatch(plateLookupReset());
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
    [dispatch, isPaid, showCheckout],
  );

  const handleRemoveImage = useCallback(() => {
    setPlateImageUrl("");
    plateImageFileRef.current = null;
    setPlateInput("");
    sessionStorage.removeItem("GUEST_EXIT_IMAGE_DATA_URL");
    if (!(isPaid && showCheckout)) {
      dispatch(ocrPlateReset());
      dispatch(plateLookupReset());
      dispatch(unifiedCheckoutReset());
      setCheckoutDone(false);
      setPaymentMethod("PAYOS");
    }
  }, [dispatch, isPaid, showCheckout]);

  const handleGoPayment = useCallback(() => {
    if (!activeSession) return;
    skipUnmountCleanupRef.current = true;
    sessionStorage.setItem(
      GUEST_EXIT_PLATE_KEY,
      activeSession.vehiclePlate || plateInput || "",
    );
    if (plateImageUrl) {
      sessionStorage.setItem("GUEST_EXIT_IMAGE_DATA_URL", plateImageUrl);
    }
    navigate("/staff/vehicle-exit/payment");
  }, [navigate, activeSession, plateInput, plateImageUrl]);

  const handleConfirmCheckout = useCallback(() => {
    if (!normalizedSession?.ticketCode) return;
    if (!plateImageFileRef.current) {
      message.error("Please upload a check-out image before confirming.");
      return;
    }
    dispatch(
      unifiedCheckoutRequest({
        ticketCode: normalizedSession.ticketCode,
        paymentMethod: isCashCheckout || (!isPaid && isDriver) ? "CASH" : "PAYOS",
        checkoutImage: plateImageFileRef.current,
      }),
    );
  }, [dispatch, isCashCheckout, isPaid, isDriver, normalizedSession]);

  const lookupErrorMessage =
    typeof lookupError === "string" ? lookupError : lookupError?.message || null;
  const noSessionFound =
    plateLookup?.lookupType === "NOT_FOUND" && !lookupLoading && plateInput;

  return (
    <div className="min-h-screen bg-[#f0f4ff] p-4 md:p-8">
      <ExitHeader />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <ExitPlateUploadCard
            isPaid={isPaid}
            showCheckout={showCheckout}
            plateImageUrl={plateImageUrl}
            isUploading={isUploading}
            ocrLoading={ocrLoading}
            plateInput={plateInput}
            onPlateChange={setPlateInput}
            onImageUpload={handleImageUpload}
            onRemoveImage={handleRemoveImage}
            normalizedSession={normalizedSession}
            sessionLoading={lookupLoading}
            reservationsLoading={false}
          />

          {lookupLoading && plateInput && !activeSession && (
            <div className="flex items-center justify-center py-8 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <Spin size="default" />
              <span className="ml-3 text-sm text-slate-500 font-medium">Finding session...</span>
            </div>
          )}

          {(lookupErrorMessage || noSessionFound) && !checkoutDone && !lookupLoading && !activeSession && (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-5 shadow-sm">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle size={18} />
                <span className="text-sm font-semibold">
                  {lookupErrorMessage || "No active session found for this plate"}
                </span>
              </div>
            </div>
          )}

          {normalizedSession && !lookupLoading && checkMode && (
            <ExitSessionInfoCard
              checkMode={checkMode}
              normalizedSession={normalizedSession}
              isDriver={isDriver}
              isGuest={isGuest}
              isPaid={isPaid}
              isCashCheckout={isCashCheckout}
              amount={amount}
            />
          )}
        </div>

        <div className="space-y-5">
          <ExitCheckoutSummary
            checkMode={checkMode}
            plateInput={plateInput}
            normalizedSession={normalizedSession}
            amount={amount}
            plateImageUrl={plateImageUrl}
            paymentReady={paymentReady}
            isPaid={isPaid}
            isCashCheckout={isCashCheckout}
          />

          <ExitReadinessCheck
            plateImageUrl={plateImageUrl}
            plateInput={plateInput}
            normalizedSession={normalizedSession}
            paymentReady={paymentReady}
            isCashCheckout={isCashCheckout}
          />

          {checkoutError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {typeof checkoutError === "string"
                ? checkoutError
                : checkoutError?.message || "Failed to checkout"}
            </div>
          )}

          <ExitCheckoutActions
            checkMode={checkMode}
            normalizedSession={normalizedSession}
            isPaid={isPaid}
            isDriver={isDriver}
            isDriverWalkIn={isDriverWalkIn}
            isCashCheckout={isCashCheckout}
            isDriverCashAtGate={isDriverCashAtGate}
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            showCheckout={showCheckout}
            checkoutLoading={checkoutLoading}
            hasCheckoutImage={Boolean(plateImageUrl)}
            onGoPayment={handleGoPayment}
            onConfirmCheckout={handleConfirmCheckout}
            onStartCheckout={() => navigate("/staff/vehicle-exit?checkout=1")}
          />
        </div>
      </div>
    </div>
  );
};

export default VehicleExit;
