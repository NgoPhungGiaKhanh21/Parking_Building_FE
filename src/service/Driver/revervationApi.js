import api from "../api";

// [DEPRECATED] Replaced by 3 separate APIs below
export const getAllSlotsApi = () => {
    return api.get("/slots/availability")
}

export const getAvailableBuildingsApi = () => {
    return api.get("/buildings/available");
};

export const getBuildingFloorsApi = ({ buildingId, vehicleTypeId }) => {
    const params = vehicleTypeId ? { vehicleTypeId } : {};
    return api.get(`/buildings/${buildingId}/floors`, { params });
};

export const getZoneSlotsApi = (zoneId) => {
    return api.get(`/zones/${zoneId}/slots`);
};

export const createReservationApi = (data) => {
    return api.post("/reservations", data)
}

export const getMyReservationsApi = () => {
    return api.get("/reservations/me")
}

export const cancelReservationApi = (reservationCode, reason) => {
    return api.post(`/reservations/${reservationCode}/cancel`, { reason: reason });
};

export const getBuildingPeakHoursApi = ({ buildingId, fromDay, toDay } = {}) => {
    const params = {};
    if (fromDay) params.fromDay = fromDay;
    if (toDay) params.toDay = toDay;
    return api.get(`/buildings/${buildingId}/peak-hours`, { params });
};