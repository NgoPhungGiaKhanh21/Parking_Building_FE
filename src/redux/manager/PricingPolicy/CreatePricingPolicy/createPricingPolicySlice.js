import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  success: false,
  error: null,
};

const createPricingPolicySlice = createSlice({
  name: "createPricingPolicy",
  initialState,
  reducers: {
    createPricingPolicyRequest: (state) => {
      state.loading = true;
      state.success = false;
      state.error = null;
    },
    createPricingPolicySuccess: (state) => {
      state.loading = false;
      state.success = true;
    },
    createPricingPolicyFail: (state, action) => {
      state.loading = false;
      state.success = false;
      state.error = action.payload;
    },
    resetCreatePricingPolicyStatus: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
});

export const {
  createPricingPolicyRequest,
  createPricingPolicySuccess,
  createPricingPolicyFail,
  resetCreatePricingPolicyStatus,
} = createPricingPolicySlice.actions;

export default createPricingPolicySlice.reducer;
