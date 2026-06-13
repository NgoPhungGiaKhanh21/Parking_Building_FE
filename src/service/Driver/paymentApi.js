import api from "../api";

export const initiatePaymentApi = (data) => {
    return api.post("/payments/initiate", data);
};
