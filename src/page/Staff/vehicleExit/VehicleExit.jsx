import { useCallback, useEffect, useLayoutEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Spin, message } from "antd";
import { AlertCircle } from "lucide-react";

import {
  exitLookupRequest,
  exitLookupReset,
} from "../../../redux/staff/parking_session/exitLookup/exitLookupSlice";
import { getAllReservationRequest } from "../../../redux/staff/reservation/getAllReservation/getAllReservationSlice";
import { ocrPlateRequest, ocrPlateReset } from "../../../redux/staff/ocrPlate/ocrPlateSlice";
import {
  unifiedCheckoutRequest,
  unifiedCheckoutReset,
} from "../../../redux/staff/parking_session/checkout/unifiedCheckoutSlice";
import { getAllPaymentsRequest } from "../../../redux/staff/payment/getAllPayments/getAllPaymentsSlice";
import { normalizeReservation } from "../../../utils/reservationSessionUtils";
import { normalizePlate, platesMatch } from "../../../utils/plateUtils";
import {
  enrichCheckoutSession,
  enrichWalkInDriverCheckoutSession,
  isGuestSessionLookup,
} from "../../../utils/plateLookupUtils";
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

const isCheckoutEligible = (r) => {
  if (!r?.ticketCode) return false;
  const status = r.reservationStatus;
  if (status === "COMPLETED" || status === "CANCELLED" || status === "EXPIRED") return false;
  return (
    status === "CHECKED_IN" ||
    status === "ACTIVE" ||
    status === "CONFIRMED" ||
    r.sessionStatus === "ACTIVE" ||
    (status === "APPROVED" && r.slotStatus === "OCCUPIED")
  );
};

const isPayOsExitReturn = () =>
  sessionStorage.getItem(GUEST_EXIT_CHECKOUT_DONE_KEY) !== "true" &&
  new URLSearchParams(window.location.search).get("checkout") === "1";

const readPayOsExitFormState = () => {
  if (!isPayOsExitReturn()) {
    return { plateInput: "", plateImageUrl: "" };
  }
  return {
    plateInput: sessionStorage.getItem(GUEST_EXIT_PLATE_KEY) || "",
    plateImageUrl: sessionStorage.getItem("GUEST_EXIT_IMAGE_DATA_URL") || "",
  };
};

const VehicleExit = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plateImageFileRef = useRef(null);
  const isActiveRef = useRef(true);
  const skipUnmountCleanupRef = useRef(false);

  const initialExitForm = useMemo(() => readPayOsExitFormState(), []);

  const [plateImageUrl, setPlateImageUrl] = useState(initialExitForm.plateImageUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("PAYOS");
  const [checkoutDone, setCheckoutDone] = useState(
    () => sessionStorage.getItem(GUEST_EXIT_CHECKOUT_DONE_KEY) === "true",
  );
  const [plateInput, setPlateInput] = useState(initialExitForm.plateInput);

  const { ocrPlate, loading: ocrLoading } = useSelector((s) => s.ocrPlate);
  const { getAllReservation, loading: reservationsLoading } = useSelector(
    (s) => s.getAllReservation,
  );
  const {
    lookup: ticketLookup,
    loading: ticketLookupLoading,
    error: ticketLookupError,
  } = useSelector((s) => s.exitLookup);
  const {
    checkoutResult,
    loading: checkoutLoading,
    error: checkoutError,
  } = useSelector((s) => s.unifiedCheckout);
  const { payments } = useSelector((s) => s.getAllPayments);

  const showCheckout = searchParams.get("checkout") === "1";

  const recognizedPlate = useMemo(() => {
    if (!ocrPlate) return null;
    return ocrPlate?.data?.plateNumber || ocrPlate?.plateNumber || ocrPlate?.data || null;
  }, [ocrPlate]);

  useEffect(() => {
    if (!initialExitForm.plateImageUrl) return;

    fetch(initialExitForm.plateImageUrl)
      .then((res) => res.blob())
      .then((blob) => {
        if (!isActiveRef.current) return;
        plateImageFileRef.current = new File([blob], "checkout-image.jpg", {
          type: "image/jpeg",
        });
      })
      .catch((err) => console.error("Failed to restore image", err));
  }, [initialExitForm.plateImageUrl]);

  useEffect(() => {
    if (!isActiveRef.current || !recognizedPlate || !plateImageUrl) return;
    setPlateInput(recognizedPlate);
  }, [recognizedPlate, plateImageUrl]);

  const reservationList = useMemo(
    () => (Array.isArray(getAllReservation) ? getAllReservation : []),
    [getAllReservation],
  );
  const activeReservationList = useMemo(
    () => reservationList.filter(isCheckoutEligible),
    [reservationList],
  );

  /** Driver reservation checkout — ticket lookup does not return checked-in reservations. */
  const driverReservation = useMemo(() => {
    if (!plateInput) return null;
    return (
      activeReservationList.find((r) => platesMatch(r.vehiclePlate, plateInput)) ?? null
    );
  }, [plateInput, activeReservationList]);

  const guestSession = useMemo(
    () => (ticketLookup ? enrichCheckoutSession(ticketLookup) : null),
    [ticketLookup],
  );
  const walkInSession = useMemo(
    () => (ticketLookup ? enrichWalkInDriverCheckoutSession(ticketLookup) : null),
    [ticketLookup],
  );

  const isDriverReserved = Boolean(driverReservation);
  const isDriverWalkIn = Boolean(walkInSession) && !isDriverReserved;
  const isGuest = isGuestSessionLookup(ticketLookup) && Boolean(guestSession);
  const isDriver = isDriverReserved;

  const activeSession = useMemo(() => {
    if (driverReservation) return driverReservation;
    if (walkInSession) return walkInSession;
    return guestSession;
  }, [driverReservation, walkInSession, guestSession]);

  const normalizedSession = useMemo(() => {
    if (!activeSession) return null;
    const base = normalizeReservation(activeSession);
    if (walkInSession) {
      return {
        ...base,
        driverFullName: base.driverFullName || base.driverUsername || walkInSession.driverFullName,
        driverUsername: base.driverUsername || walkInSession.driverUsername,
      };
    }
    if (!driverReservation?.username) return base;
    return {
      ...base,
      driverUsername: base.driverUsername || driverReservation.username,
      driverFullName: base.driverFullName || driverReservation.username,
    };
  }, [activeSession, driverReservation, walkInSession]);

  const isPaid = isGuestSessionPaid(activeSession, payments);
  const isCashCheckout = !isPaid && paymentMethod === "CASH";
  const isDriverCashAtGate = isDriver && !isPaid;
  const paymentReady = isPaid || isCashCheckout || isDriverCashAtGate;
  const amount = resolveGuestSessionAmount(activeSession);
  const checkMode = resolveExitCheckMode({ isDriverWalkIn, isDriver, isGuest });

  const sessionLoading = ticketLookupLoading || reservationsLoading;

  useLayoutEffect(() => {
    return () => {
      if (skipUnmountCleanupRef.current) return;
      isActiveRef.current = false;
      setStaffExitMounted(false);
      dispatch(ocrPlateReset());
      dispatch(exitLookupReset());
      dispatch(unifiedCheckoutReset());
    };
  }, [dispatch]);

  useEffect(() => {
    if (!isActiveRef.current || !plateInput) return;

    const handler = setTimeout(() => {
      if (!isActiveRef.current) return;
      dispatch(getAllReservationRequest());
      dispatch(
        exitLookupRequest({
          plateNumber: normalizePlate(plateInput),
        }),
      );
    }, 800);

    return () => clearTimeout(handler);
  }, [plateInput, dispatch]);

  useLayoutEffect(() => {
    isActiveRef.current = true;
    setStaffExitMounted(true);
    skipUnmountCleanupRef.current = false;

    if (!isPayOsExitReturn()) {
      dispatch(ocrPlateReset());
      dispatch(exitLookupReset());
      dispatch(unifiedCheckoutReset());
      plateImageFileRef.current = null;
    }
  }, [dispatch, searchParams]);

  useEffect(() => {
    isActiveRef.current = true;
    setStaffExitMounted(true);

    dispatch(getAllReservationRequest());
    dispatch(getAllPaymentsRequest());

    return () => {
      isActiveRef.current = false;
      setStaffExitMounted(false);
      if (skipUnmountCleanupRef.current) return;
      dispatch(ocrPlateReset());
      dispatch(exitLookupReset());
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
    dispatch(exitLookupReset());
    dispatch(getAllReservationRequest());
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
        dispatch(exitLookupReset());
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
      dispatch(exitLookupReset());
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
    typeof ticketLookupError === "string"
      ? ticketLookupError
      : ticketLookupError?.message || null;
  const searchSettled = plateInput && !sessionLoading;
  const noSessionFound = searchSettled && !activeSession && !lookupErrorMessage;

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
            sessionLoading={sessionLoading}
            reservationsLoading={reservationsLoading}
          />

          {sessionLoading && plateInput && !activeSession && (
            <div className="flex items-center justify-center py-8 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <Spin size="default" />
              <span className="ml-3 text-sm text-slate-500 font-medium">Finding session...</span>
            </div>
          )}

          {noSessionFound && !checkoutDone && (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-5 shadow-sm">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle size={18} />
                <span className="text-sm font-semibold">
                  No active session found for this plate
                </span>
              </div>
            </div>
          )}

          {lookupErrorMessage && !checkoutDone && !sessionLoading && !activeSession && (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-5 shadow-sm">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle size={18} />
                <span className="text-sm font-semibold">{lookupErrorMessage}</span>
              </div>
            </div>
          )}

          {normalizedSession && !sessionLoading && checkMode && (
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
