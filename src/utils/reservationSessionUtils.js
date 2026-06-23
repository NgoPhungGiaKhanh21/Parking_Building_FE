import dayjs from "dayjs";

const pick = (...values) => {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
};

const getSession = (record) =>
  record?.session ??
  record?.parkingSession ??
  record?.sessionDto ??
  record?.parkingSessionDto ??
  record?.parking_session ??
  {};

export const resolveImageUrl = (url) => {
  if (!url) return undefined;
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:")
  ) {
    return url;
  }
  const apiBase = import.meta.env.VITE_API_URL || "";
  const origin = apiBase.replace(/\/api\/?$/, "");
  return `${origin}${url.startsWith("/") ? url : `/${url}`}`;
};

export const normalizeReservation = (record) => {
  if (!record) return record;
  const session = getSession(record);

  return {
    ...record,
    ...session,
    sessionId: pick(record.sessionId, session.sessionId, record.session_id),
    reservationId: pick(
      record.reservationId,
      session.reservationId,
      record.reservation_id,
    ),
    ticketCode: pick(record.ticketCode, session.ticketCode, record.ticket_code),
    checkinTime: pick(
      record.checkinTime,
      session.checkinTime,
      record.checkin_time,
      record.reservationStart,
    ),
    checkoutTime: pick(
      record.checkoutTime,
      session.checkoutTime,
      record.checkout_time,
      record.checkOutTime,
      record.estimatedCheckoutTime,
      record.reservationEnd,
    ),
    checkinImageUrl: resolveImageUrl(
      pick(
        record.checkinImageUrl,
        session.checkinImageUrl,
        record.checkin_image_url,
      ),
    ),
    checkoutImageUrl: resolveImageUrl(
      pick(
        record.checkoutImageUrl,
        session.checkoutImageUrl,
        record.checkout_image_url,
      ),
    ),
    totalFee: pick(record.totalFee, session.totalFee, record.total_fee),
    parkingHours: pick(record.parkingHours, session.parkingHours),
    parkingMinutes: pick(record.parkingMinutes, session.parkingMinutes),
    paymentStatus: pick(record.paymentStatus, session.paymentStatus),
    sessionStatus: pick(record.sessionStatus, session.sessionStatus),
  };
};

export const mergeCheckoutSession = (reservation, checkoutResult) => {
  const base = normalizeReservation(reservation);
  const checkout = normalizeReservation(checkoutResult);
  return {
    ...base,
    ...checkout,
    checkinTime: pick(checkout.checkinTime, base.checkinTime),
    checkinImageUrl: pick(checkout.checkinImageUrl, base.checkinImageUrl),
    checkoutTime: pick(checkout.checkoutTime, base.checkoutTime),
    checkoutImageUrl: pick(checkout.checkoutImageUrl, base.checkoutImageUrl),
    totalFee: pick(checkout.totalFee, base.totalFee),
    reservationStatus: "COMPLETED",
  };
};

export const recordsMatch = (a, b) => {
  if (!a || !b) return false;
  return (
    (a.ticketCode && b.ticketCode && a.ticketCode === b.ticketCode) ||
    (a.sessionId && b.sessionId && a.sessionId === b.sessionId) ||
    (a.reservationId &&
      b.reservationId &&
      a.reservationId === b.reservationId)
  );
};

export const formatParkingDurationLabel = (r) => {
  if (r.parkingHours != null || r.parkingMinutes != null) {
    return `${r.parkingHours ?? 0}h ${r.parkingMinutes ?? 0}m`;
  }
  if (r.checkinTime && r.checkoutTime) {
    const diffMinutes = dayjs(r.checkoutTime).diff(dayjs(r.checkinTime), "minute");
    if (diffMinutes >= 0) {
      return `${Math.floor(diffMinutes / 60)}h ${diffMinutes % 60}m`;
    }
  }
  return "—";
};

