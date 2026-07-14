import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  checkoutResult: null,
  loading: false,
  error: null,
};

const unifiedCheckoutSlice = createSlice({
  name: "unifiedCheckout",
  initialState,
  reducers: {
    unifiedCheckoutRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.checkoutResult = null;
    },
    unifiedCheckoutSuccess: (state, action) => {
      state.loading = false;
      state.checkoutResult = action.payload;
    },
    unifiedCheckoutFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    unifiedCheckoutReset: (state) => {
      state.loading = false;
      state.error = null;
      state.checkoutResult = null;
    },
  },
});

export const {
  unifiedCheckoutRequest,
  unifiedCheckoutSuccess,
  unifiedCheckoutFail,
  unifiedCheckoutReset,
} = unifiedCheckoutSlice.actions;

export default unifiedCheckoutSlice.reducer;
