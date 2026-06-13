import api from "../api";

export const checkInApi = (data) => {
    return api.post("/sessions/checkin", data);
}