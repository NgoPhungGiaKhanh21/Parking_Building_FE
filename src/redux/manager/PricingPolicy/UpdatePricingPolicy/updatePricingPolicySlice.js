import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  success: false,
  error: null,
};

const updatePricingPolicySlice = createSlice({
  name: "updatePricingPolicy",
  initialState,
  reducers: {
    updatePricingPolicyRequest: (state) => {
      state.loading = true;
      state.success = false;
      state.error = null;
    },
    updatePricingPolicySuccess: (state) => {
      state.loading = false;
      state.success = true;
    },
    updatePricingPolicyFail: (state, action) => {
      state.loading = false;
      state.success = false;
      state.error = action.payload;
    },
    resetUpdatePricingPolicyStatus: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
});

export const {
  updatePricingPolicyRequest,
  updatePricingPolicySuccess,
  updatePricingPolicyFail,
  resetUpdatePricingPolicyStatus,
} = updatePricingPolicySlice.actions;

export default updatePricingPolicySlice.reducer;
