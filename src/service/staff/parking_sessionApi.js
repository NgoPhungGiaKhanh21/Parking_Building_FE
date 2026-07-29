import api from "../api";
import { normalizePlate } from "../../utils/plateUtils";
import {
  normalizeTicketLookupResponse,
  resolveTicketCheckoutSession,
} from "../../utils/plateLookupUtils";

const encodePlate = (plateNumber) =>
  encodeURIComponent(normalizePlate(plateNumber));

/** Staff plate lookup — entry check-in only. */
export const plateLookupForCheckinApi = (data) => {
  const plate = encodePlate(data.plateNumber);
  const params = {};
  if (data.buildingId) params.buildingId = data.buildingId;
  return api.get(`sessions/plate/${plate}/lookup`, { params });
};

/** Resolve active session ticket from plate (staff checkout). */
export const resolveTicketCodeByPlateApi = (data) => {
  const plate = encodePlate(data.plateNumber);
  return api.get(`sessions/plate/${plate}/ticket-code`);
};

/** Staff checkout lookup by ticket code (guest + driver walk-in). */
export const ticketLookupApi = (ticketCode) =>
  api.get(`sessions/ticket/${encodeURIComponent(ticketCode)}/lookup`);

export const getSessionByPlateNumberApi = async (data) => {
  const ticketResponse = await resolveTicketCodeByPlateApi(data);
  const ticketData = ticketResponse?.data?.data ?? ticketResponse?.data;

  if (!ticketData?.found || !ticketData?.ticketCode) {
    const error = new Error("Session not found");
    error.response = { status: 404, data: { message: "Session not found" } };
    throw error;
  }

  const lookupResponse = await ticketLookupApi(ticketData.ticketCode);
  const lookup = normalizeTicketLookupResponse(
    lookupResponse?.data?.data ?? lookupResponse?.data,
  );
  const session = resolveTicketCheckoutSession(lookup);

  if (!session) {
    const error = new Error("Session not found");
    error.response = { status: 404, data: { message: "Session not found" } };
    throw error;
  }

  return { data: { data: session, success: true } };
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
};

// Unified Staff Checkout API — POST /api/sessions/checkout
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
