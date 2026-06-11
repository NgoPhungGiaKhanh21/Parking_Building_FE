import api from "../api";

export const getAllSlotsApi = () => {
    return api.get("/slots/availability")
}

export const createReservationApi = (data) => {
    return api.post("/reservations", data)
}

export const getMyReservationsApi = () => {
    return api.get("/reservations/me")
}