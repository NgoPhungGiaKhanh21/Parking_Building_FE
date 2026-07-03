import api from "../api";

export const forgotPasswordApi = (data) => {
    return api.post("/auth/forgot-password", data);
}

export const verifyOtpApi = (data) => {
    return api.post("/auth/verify-otp", data);
}

export const resetPasswordApi = (data) => {
    return api.post("/auth/reset-password", data);
}
