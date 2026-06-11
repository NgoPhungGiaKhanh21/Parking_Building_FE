import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  success: false,
  error: null,
};

const deletePricingPolicySlice = createSlice({
  name: "deletePricingPolicy",
  initialState,
  reducers: {
    deletePricingPolicyRequest: (state) => {
      state.loading = true;
      state.success = false;
      state.error = null;
    },
    deletePricingPolicySuccess: (state) => {
      state.loading = false;
      state.success = true;
    },
    deletePricingPolicyFail: (state, action) => {
      state.loading = false;
      state.success = false;
      state.error = action.payload;
    },
    resetDeletePricingPolicyStatus: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
});

export const {
  deletePricingPolicyRequest,
  deletePricingPolicySuccess,
  deletePricingPolicyFail,
  resetDeletePricingPolicyStatus,
} = deletePricingPolicySlice.actions;

export default deletePricingPolicySlice.reducer;
