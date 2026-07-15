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
    // Note: Changed from /staff/reservations to /reservations (Driver API)
    // and changed payload key to 'reason' based on Swagger
    return api.post(`/reservations/${reservationCode}/cancel`, { reason: reason });
};