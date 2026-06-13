import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    confirmResult: null,
    loading: false,
    error: null,
};

const confirmPaymentByStaffSlice = createSlice({
    name: "confirmPaymentByStaff",
    initialState,
    reducers: {
        confirmPaymentByStaffRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        confirmPaymentByStaffSuccess: (state, action) => {
            state.loading = false;
            state.confirmResult = action.payload;
        },
        confirmPaymentByStaffFail: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
    },
});

export const {
    confirmPaymentByStaffRequest,
    confirmPaymentByStaffSuccess,
    confirmPaymentByStaffFail,
} = confirmPaymentByStaffSlice.actions;

export default confirmPaymentByStaffSlice.reducer;
