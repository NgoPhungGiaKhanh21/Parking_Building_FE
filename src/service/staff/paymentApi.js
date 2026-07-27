import api from "../api";

export const getAllPaymentsApi = () => {
    return api.get("/payments");
};

export const confirmPaymentByStaffApi = (data) => {
    return api.post("/payments/confirm-by-staff", data);
};
