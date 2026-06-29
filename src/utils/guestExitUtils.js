export const GUEST_EXIT_PLATE_KEY = "guestExitPlate";
export const GUEST_EXIT_PAID_KEY = "guestExitPaid";
export const GUEST_EXIT_CHECKOUT_DONE_KEY = "guestExitCheckoutDone";
/** Set trước khi redirect PayOS — nhận diện khi BE trả về /payment/success */
export const GUEST_PAYMENT_PENDING_KEY = "guestPaymentPending";

export const isGuestStaffPaymentReturn = () => {
  const role = sessionStorage.getItem("role");
  return (
    role === "ROLE_STAFF" ||
    sessionStorage.getItem(GUEST_PAYMENT_PENDING_KEY) === "true"
  );
};

export const getFrontendBaseUrl = () =>
  import.meta.env.VITE_APP_URL || window.location.origin;

/** BE PayOS return thường redirect cứng /payment/success — FE phân nhánh trong PaymentSuccess. */
export const getGuestPaymentRedirectUrls = () => {
  const base = getFrontendBaseUrl();
  return {
    frontendReturnUrl: `${base}/payment/success`,
    frontendCancelUrl: `${base}/payment/failed`,
  };
};

export const resolveGuestSessionAmount = (session) =>
  session?.estimatedFee ??
  session?.basePrice ??
  session?.currentAccumulatedFee ??
  0;

export const isGuestSessionPaid = (session, payments) => {
  if (!session) return false;

  const status = String(session.paymentStatus || "").toUpperCase();
  if (status === "PAID" || status === "CONFIRMED") return true;
  if (sessionStorage.getItem(GUEST_EXIT_PAID_KEY) === "true") return true;

  const list = Array.isArray(payments) ? payments : [];
  return list.some((p) => {
    const bySession =
      session.sessionId &&
      p.sessionId &&
      String(p.sessionId) === String(session.sessionId);
    const byTicket =
      session.ticketCode &&
      p.ticketCode &&
      String(p.ticketCode) === String(session.ticketCode);
    if (!bySession && !byTicket) return false;

    const paidStatus = String(p.paidStatus || "").toUpperCase();
    const paymentStatus = String(p.paymentStatus || "").toUpperCase();
    return (
      paidStatus === "PAID" ||
      paymentStatus === "PAID" ||
      paymentStatus === "CONFIRMED"
    );
  });
};

export const buildGuestPaymentPayload = (session, note, amount) => ({
  sessionId: session.sessionId ?? "",
  ticketCode: session.ticketCode ?? "",
  reservationCode: session.reservationCode ?? "",
  paymentMethod: "PAYOS",
  amount: amount ?? resolveGuestSessionAmount(session),
  driverId: "",
  note: note?.trim() || "",
  ...getGuestPaymentRedirectUrls(),
});
