import api from "../api";

export const getSessionByPlateNumberApi = (data) => {
  const plate = encodeURIComponent(String(data.plateNumber || "").trim());
  return api.get(`sessions/guest/plate/${plate}`);
};

export const checkInApi = (data) => {
  const formData = new FormData();
  if (data.checkinImage) {
    formData.append("checkinImage", data.checkinImage);
  }

  const params = new URLSearchParams();
  if (data.ticketCode) params.append("ticketCode", data.ticketCode);
  if (data.plateNumber) params.append("plateNumber", data.plateNumber);
  if (data.vehicleColor) params.append("vehicleColor", data.vehicleColor);
  if (data.vehicleTypeId) params.append("vehicleTypeId", data.vehicleTypeId);

  return api.post(`sessions/checkin?${params.toString()}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const guestCheckInApi = (data) => {
  const formData = new FormData();
  if (data.checkinImage) {
    formData.append("checkinImage", data.checkinImage);
  }

  const params = new URLSearchParams();
  if (data.plateNumber) params.append("plateNumber", data.plateNumber);
  if (data.vehicleTypeId) params.append("vehicleTypeId", data.vehicleTypeId);
  if (data.slotId) params.append("slotId", data.slotId);
  if (data.vehicleColor) params.append("vehicleColor", data.vehicleColor);
  if (data.brand) params.append("brand", data.brand);
  if (data.model) params.append("model", data.model);
  if (data.guestName) params.append("guestName", data.guestName);
  if (data.guestPhone) params.append("guestPhone", data.guestPhone);
  if (data.note) params.append("note", data.note);

  return api.post(`sessions/guest/checkin?${params.toString()}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const checkOutApi = (data) => {
  if (data.checkoutImage) {
    const formData = new FormData();
    formData.append("checkoutImage", data.checkoutImage);

    const params = new URLSearchParams();
    if (data.ticketCode) params.append("ticketCode", data.ticketCode);
    if (data.paymentMethod) params.append("paymentMethod", data.paymentMethod);

    return api.post(`sessions/checkout?${params.toString()}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  return api.post("/sessions/checkout", {
    ticketCode: data.ticketCode,
    paymentMethod: data.paymentMethod,
    checkoutImageUrl: data.checkoutImageUrl || "",
  });
};
