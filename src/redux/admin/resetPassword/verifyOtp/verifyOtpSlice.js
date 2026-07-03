import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    verifyOtp: [], 
    loading: false,
    error: null,
}

const verifyOtpSlice = createSlice({
    name: "verifyOtp",
    initialState,
    reducers: {
        verifyOtpRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        verifyOtpSuccess: (state, action) => {
            state.loading = false;
            state.verifyOtp = action.payload;
        },
        verifyOtpFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
    },
})

export const { verifyOtpRequest, verifyOtpSuccess, verifyOtpFailure } = verifyOtpSlice.actions;
export default verifyOtpSlice.reducer;