import api from "../api";
import { normalizePlate } from "../../utils/plateUtils";
import {
  enrichSessionFromPlateLookup,
  mergeDriverInfo,
  readWalkInDriverCache,
  isDriverWalkInSession,
  mapGuestSessionFields,
  mapManagerVehicleToRegistered,
  mapReservationToRegisteredVehicle,
  resolveRegisteredVehicleFromReservations,
} from "../../utils/walkInSessionUtils";

const encodePlate = (plateNumber) =>
  encodeURIComponent(normalizePlate(plateNumber));

/** Staff plate lookup before check-in / check-out. */
export const plateLookupForCheckinApi = (data) => {
  const plate = encodePlate(data.plateNumber);
  const params = {};
  if (data.buildingId) params.buildingId = data.buildingId;
  return api.get(`sessions/plate/${plate}/lookup`, { params });
};

const findVehicleByPlate = (list, plate) =>
  (Array.isArray(list) ? list : []).find(
    (item) =>
      normalizePlate(item?.plateNumber || item?.vehiclePlate) === plate &&
      (item?.userId || item?.username),
  );

/** Resolve registered driver vehicle when BE lookup returns NOT_FOUND. */
export const resolveRegisteredVehicleByPlate = async (
  plateNumber,
  reservations = [],
) => {
  const plate = normalizePlate(plateNumber);
  if (!plate) return null;

  const fromLocal = resolveRegisteredVehicleFromReservations(
    plate,
    reservations,
  );
  if (fromLocal) return fromLocal;

  try {
    const res = await api.get("/manager/vehicles", {
      params: { plateNumber: plate },
    });
    const list = res.data?.data ?? res.data ?? [];
    const match = findVehicleByPlate(list, plate);
    if (match) return mapManagerVehicleToRegistered(match);
  } catch {
    // Staff role may not access manager API — fall through
  }

  try {
    const byPlate = await api.get("staff/reservations/by-plate", {
      params: { plateNumber: plate },
    });
    const pending = byPlate.data?.data ?? byPlate.data ?? [];
    const match = Array.isArray(pending) ? pending[0] : pending;
    if (match) return mapReservationToRegisteredVehicle(match);
  } catch {
    // ignore
  }

  try {
    const all = await api.get("staff/reservations");
    const list = all.data?.data ?? all.data ?? [];
    const match = (Array.isArray(list) ? list : []).find(
      (item) =>
        normalizePlate(item?.vehiclePlate) === plate && item?.username,
    );
    if (match) return mapReservationToRegisteredVehicle(match);
  } catch {
    // ignore
  }

  return null;
};

/**
 * BE lookup trả NOT_FOUND khi xe driver đã đăng ký nhưng chưa có reservation.
 * Bổ sung bước resolve registered vehicle để UI hiện Driver Walk-in.
 */
export const resolvePlateLookupForCheckinApi = async (data) => {
  const response = await plateLookupForCheckinApi(data);
  const payload = response?.data?.data ?? response?.data;

  if (
    payload?.lookupType === "RESERVATION" ||
    payload?.lookupType === "GUEST_SESSION"
  ) {
    return payload;
  }

  if (payload?.lookupType === "DRIVER_WALK_IN" && payload?.registeredVehicle) {
    return payload;
  }

  const registered = await resolveRegisteredVehicleByPlate(
    data.plateNumber,
    data.reservations,
  );

  if (registered) {
    return {
      lookupType: "DRIVER_WALK_IN",
      registeredVehicle: registered,
    };
  }

  return payload ?? { lookupType: "NOT_FOUND" };
};

const findDriverFromStaffReservations = async (plateNumber) => {
  const plate = normalizePlate(plateNumber);
  if (!plate) return null;

  try {
    const byPlate = await api.get("staff/reservations/by-plate", {
      params: { plateNumber: plate },
    });
    const pending = byPlate.data?.data ?? byPlate.data ?? [];
    const match = Array.isArray(pending) ? pending[0] : pending;
    if (match?.username) {
      return {
        driverUsername: match.username,
        driverFullName: match.username,
      };
    }
  } catch {
    // ignore and fall through
  }

  try {
    const all = await api.get("staff/reservations");
    const list = all.data?.data ?? all.data ?? [];
    const match = (Array.isArray(list) ? list : []).find(
      (item) =>
        normalizePlate(item.vehiclePlate) === plate && item.username,
    );
    if (match) {
      return {
        driverUsername: match.username,
        driverFullName: match.username,
      };
    }
  } catch {
    // ignore
  }

  return null;
};

const attachDriverInfoToSession = async (session, plateNumber) => {
  if (!session) return session;

  const normalized = mapGuestSessionFields(session);
  if (!isDriverWalkInSession(normalized)) return session;
  if (normalized.driverFullName && normalized.driverUsername) return normalized;

  const cached = readWalkInDriverCache(
    plateNumber || normalized.vehiclePlate,
    normalized.ticketCode,
  );
  let merged = mergeDriverInfo(normalized, cached);

  if (merged.driverFullName || merged.driverUsername) return merged;

  const fromReservations = await findDriverFromStaffReservations(
    plateNumber || normalized.vehiclePlate,
  );
  merged = mergeDriverInfo(merged, fromReservations);

  return merged;
};

export const getSessionByPlateNumberApi = async (data) => {
  const plate = encodePlate(data.plateNumber);
  try {
    const lookup = await plateLookupForCheckinApi(data);
    const payload = lookup.data?.data ?? lookup.data;
    let enriched = enrichSessionFromPlateLookup(payload);
    if (enriched) {
      enriched = await attachDriverInfoToSession(enriched, data.plateNumber);
      return { data: { data: enriched, success: true } };
    }
  } catch {
    // fall through to legacy guest endpoint
  }

  const legacy = await api.get(`sessions/guest/plate/${plate}`);
  const legacySession = legacy.data?.data ?? legacy.data;
  let enrichedLegacy = enrichSessionFromPlateLookup({
    lookupType: "GUEST_SESSION",
    guestSession: legacySession,
  });
  enrichedLegacy = await attachDriverInfoToSession(
    enrichedLegacy ?? legacySession,
    data.plateNumber,
  );
  return {
    ...legacy,
    data: {
      ...legacy.data,
      data: enrichedLegacy ?? legacySession,
    },
  };
};

export const checkInApi = (data) => {
  const formData = new FormData();
  if (data.checkinImage) formData.append("checkinImage", data.checkinImage);
  if (data.plateImage) formData.append("plateImage", data.plateImage);

  const params = new URLSearchParams();
  if (data.ticketCode) params.append("ticketCode", data.ticketCode);
  if (data.plateNumber) params.append("plateNumber", data.plateNumber);
  if (data.vehicleColor) params.append("vehicleColor", data.vehicleColor);
  if (data.vehicleTypeId) params.append("vehicleTypeId", data.vehicleTypeId);
  if (data.buildingId) params.append("buildingId", data.buildingId);
  if (data.guestName) params.append("guestName", data.guestName);
  if (data.guestPhone) params.append("guestPhone", data.guestPhone);
  if (data.note) params.append("note", data.note);

  return api.post(`sessions/checkin?${params.toString()}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// export const guestCheckInApi = (data) => {
//   const formData = new FormData();
//   if (data.checkinImage) {
//     formData.append("checkinImage", data.checkinImage);
//   }

//   const params = new URLSearchParams();
//   if (data.plateNumber) params.append("plateNumber", data.plateNumber);
//   if (data.vehicleTypeId) params.append("vehicleTypeId", data.vehicleTypeId);
//   if (data.slotId) params.append("slotId", data.slotId);
//   if (data.vehicleColor) params.append("vehicleColor", data.vehicleColor);
//   if (data.brand) params.append("brand", data.brand);
//   if (data.model) params.append("model", data.model);
//   if (data.guestName) params.append("guestName", data.guestName);
//   if (data.guestPhone) params.append("guestPhone", data.guestPhone);
//   if (data.note) params.append("note", data.note);

//   return api.post(`sessions/guest/checkin?${params.toString()}`, formData, {
//     headers: {
//       "Content-Type": "multipart/form-data",
//     },
//   });
// };

// New Quick Check-in API (supports both DRIVER and GUEST modes)
export const quickCheckInApi = (data) => {
  const formData = new FormData();
  if (data.plateImage) {
    formData.append("plateImage", data.plateImage);
  }
  if (data.buildingId) {
    formData.append("buildingId", data.buildingId);
  }
  if (data.vehicleTypeId) {
    formData.append("vehicleTypeId", data.vehicleTypeId);
  }
  if (data.mode) {
    formData.append("mode", data.mode);
  }

  return api.post(`sessions/quick-checkin`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// export const checkOutApi = (data) => {
//   if (data.checkoutImage) {
//     const formData = new FormData();
//     formData.append("checkoutImage", data.checkoutImage);

//     const params = new URLSearchParams();
//     if (data.ticketCode) params.append("ticketCode", data.ticketCode);
//     if (data.paymentMethod) params.append("paymentMethod", data.paymentMethod);

//     return api.post(`sessions/checkout?${params.toString()}`, formData, {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     });
//   }

//   return api.post("/sessions/checkout", {
//     ticketCode: data.ticketCode,
//     paymentMethod: data.paymentMethod,
//     checkoutImageUrl: data.checkoutImageUrl || "",
//   });
// };

export const ocrPlateApi = (data) => {
  return api.post(`/ocr/plate/upload`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Guest Checkout with OCR — POST /api/sessions/guest/checkout/ocr
export const guestCheckoutOcrApi = (data) => {
  const formData = new FormData();
  if (data.plateImage) {
    formData.append("plateImage", data.plateImage);
  }
  if (data.ticketCode) {
    formData.append("ticketCode", data.ticketCode);
  }
  if (data.paymentMethod) {
    formData.append("paymentMethod", data.paymentMethod);
  }
  if (data.checkoutImage) {
    formData.append("checkoutImage", data.checkoutImage);
  }
  if (data.checkoutImageUrl) {
    formData.append("checkoutImageUrl", data.checkoutImageUrl);
  }

  return api.post(`sessions/guest/checkout/ocr`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getStaffBuildingApi = (data) => {
  return api.get("/staff/buildings", data);
}

// Unified Staff Checkout API — POST /api/sessions/checkout
// Query params: ticketCode, paymentMethod
// FormData: plateImage (optional), checkoutImage (optional)
export const unifiedCheckoutApi = (data) => {
  if (!data.plateImage && !data.checkoutImage && !data.paymentMethod) {
    return api.post("/sessions/checkout", {
      ticketCode: data.ticketCode,
    });
  }

  const formData = new FormData();
  if (data.plateImage) formData.append("plateImage", data.plateImage);
  if (data.checkoutImage) formData.append("checkoutImage", data.checkoutImage);

  const params = new URLSearchParams();
  if (data.ticketCode) params.append("ticketCode", data.ticketCode);
  if (data.paymentMethod) params.append("paymentMethod", data.paymentMethod);

  return api.post(`/sessions/checkout?${params.toString()}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
