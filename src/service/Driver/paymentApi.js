import api from "../api";

export const initiatePaymentApi = (data) => {
    return api.post("/payments/initiate", data);
};

export const getDriverPaymentsApi = (driverId, limit = 20) => {
    return api.get(`/payments/driver/${driverId}`, { params: { limit } });
};

