import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    payments: [],
    loading: false,
    error: null,
};

const getAllPaymentsSlice = createSlice({
    name: "getAllPayments",
    initialState,
    reducers: {
        getAllPaymentsRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        getAllPaymentsSuccess: (state, action) => {
            state.loading = false;
            state.payments = Array.isArray(action.payload) ? action.payload : [];
        },
        getAllPaymentsFail: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
    },
});

export const {
    getAllPaymentsRequest,
    getAllPaymentsSuccess,
    getAllPaymentsFail,
} = getAllPaymentsSlice.actions;

export default getAllPaymentsSlice.reducer;
