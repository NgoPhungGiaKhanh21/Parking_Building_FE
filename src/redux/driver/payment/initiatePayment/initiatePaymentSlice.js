import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    paymentResult: null,
    loading: false,
    error: null,
};

const initiatePaymentSlice = createSlice({
    name: "initiatePayment",
    initialState,
    reducers: {
        initiatePaymentRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        initiatePaymentSuccess: (state, action) => {
            state.loading = false;
            state.paymentResult = action.payload;
        },
        initiatePaymentFail: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        resetInitiatePayment: (state) => {
            state.paymentResult = null;
            state.error = null;
        },
    },
});

export const {
    initiatePaymentRequest,
    initiatePaymentSuccess,
    initiatePaymentFail,
    resetInitiatePayment,
} = initiatePaymentSlice.actions;

export default initiatePaymentSlice.reducer;
