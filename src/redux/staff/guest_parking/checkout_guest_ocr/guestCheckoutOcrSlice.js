import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    checkoutResult: null,
    loading: false,
    error: null,
};

const guestCheckoutOcrSlice = createSlice({
    name: "guestCheckoutOcr",
    initialState,
    reducers: {
        guestCheckoutOcrRequest: (state, action) => {
            state.loading = true;
            state.error = null;
        },
        guestCheckoutOcrSuccess: (state, action) => {
            state.loading = false;
            state.checkoutResult = action.payload;
        },
        guestCheckoutOcrFail: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        guestCheckoutOcrReset: (state) => {
            state.checkoutResult = null;
            state.loading = false;
            state.error = null;
        },
    },
});

export const {
    guestCheckoutOcrRequest,
    guestCheckoutOcrSuccess,
    guestCheckoutOcrFail,
    guestCheckoutOcrReset,
} = guestCheckoutOcrSlice.actions;

export default guestCheckoutOcrSlice.reducer;
