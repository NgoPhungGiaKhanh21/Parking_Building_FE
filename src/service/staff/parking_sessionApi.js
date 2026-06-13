import api from "../api";

export const checkInApi = (data) => {
    return api.post("/sessions/checkin", data);
};

export const checkOutApi = (data) => {
    return api.post("/sessions/checkout", data);
};
