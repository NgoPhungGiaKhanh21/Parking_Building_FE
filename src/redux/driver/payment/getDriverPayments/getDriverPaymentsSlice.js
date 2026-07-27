import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    payments: [],
    loading: false,
    error: null,
};

const getDriverPaymentsSlice = createSlice({
    name: "getDriverPayments",
    initialState,
    reducers: {
        getDriverPaymentsRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        getDriverPaymentsSuccess: (state, action) => {
            state.loading = false;
            state.payments = Array.isArray(action.payload) ? action.payload : [];
        },
        getDriverPaymentsFail: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
    },
});

export const {
    getDriverPaymentsRequest,
    getDriverPaymentsSuccess,
    getDriverPaymentsFail,
} = getDriverPaymentsSlice.actions;

export default getDriverPaymentsSlice.reducer;
