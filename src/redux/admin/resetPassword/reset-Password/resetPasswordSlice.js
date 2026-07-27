import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    resetPassword: [], 
    loading: false,
    error: null,
    success: false,
}

const resetPasswordSlice = createSlice({
    name: "resetPassword",
    initialState,
    reducers: {
        resetPasswordRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        },
        resetPasswordSuccess: (state, action) => {
            state.loading = false;
            state.resetPassword = action.payload;
            state.success = true;
        },
        resetPasswordFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
    },
})

export const { resetPasswordRequest, resetPasswordSuccess, resetPasswordFailure } = resetPasswordSlice.actions;
export default resetPasswordSlice.reducer;
