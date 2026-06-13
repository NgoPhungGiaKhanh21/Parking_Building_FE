import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    checkoutResult: null,
    loading: false,
    error: null,
};

const createCheckoutSlice = createSlice({
    name: "createCheckout",
    initialState,
    reducers: {
        createCheckoutRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        createCheckoutSuccess: (state, action) => {
            state.loading = false;
            state.checkoutResult = action.payload;
        },
        createCheckoutFail: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        resetCheckout: (state) => {
            state.checkoutResult = null;
            state.error = null;
        },
    },
});

export const {
    createCheckoutRequest,
    createCheckoutSuccess,
    createCheckoutFail,
    resetCheckout,
} = createCheckoutSlice.actions;

export default createCheckoutSlice.reducer;
