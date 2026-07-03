import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    forgotPassword: [],
    loading: false,
    error: null,
}

const forgotPasswordSlice = createSlice({
    name: "forgotPassword",
    initialState,
    reducers: {
        forgotPasswordRequest: (state) => {
            state.loading = true;
        },
        forgotPasswordSuccess: (state, action) => {
            state.loading = false;
            state.forgotPassword = action.payload;
        },
        forgotPasswordFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
    }
})

export const { forgotPasswordRequest, forgotPasswordSuccess, forgotPasswordFailure } = forgotPasswordSlice.actions;

export default forgotPasswordSlice.reducer;