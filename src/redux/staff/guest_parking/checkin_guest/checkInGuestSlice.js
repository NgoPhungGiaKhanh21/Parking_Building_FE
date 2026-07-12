import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    checkInGuest: null,
    loading: false,
    error: null,
}

const checkInGuestSlice = createSlice({
    name: "checkInGuest",
    initialState,
    reducers: {
        checkInGuestRequest: (state, action) => {
            state.loading = true;
            state.error = null;
        },
        checkInGuestSuccess: (state, action) => {
            state.loading = false;
            state.checkInGuest = action.payload;
        },
        checkInGuestFail: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        checkInGuestReset: (state) => {
            state.checkInGuest = null;
            state.loading = false;
            state.error = null;
        },
    },
});

export const {
    checkInGuestRequest,
    checkInGuestSuccess,
    checkInGuestFail,
    checkInGuestReset,
} = checkInGuestSlice.actions;

export default checkInGuestSlice.reducer;
