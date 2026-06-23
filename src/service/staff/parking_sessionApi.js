import api from "../api";

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

export const checkOutApi = (data) => {
    return api.post("/sessions/checkout", data);
};
