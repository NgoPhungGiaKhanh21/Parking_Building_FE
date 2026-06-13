import api from "../api";

export const getAllReservationApi = () => {
    return api.get("staff/reservations");
}

export const approveReservationApi = (data) => {
    return api.patch(`/staff/reservations/${data.reservationCode}/status`, { status: data.status, note: data.note })
}