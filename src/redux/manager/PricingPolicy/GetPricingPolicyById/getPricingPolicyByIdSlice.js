import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  policy: null,
  error: null,
};

const getPricingPolicyByIdSlice = createSlice({
  name: "getPricingPolicyById",
  initialState,
  reducers: {
    getPricingPolicyByIdRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getPricingPolicyByIdSuccess: (state, action) => {
      state.loading = false;
      state.policy = action.payload;
    },
    getPricingPolicyByIdFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.policy = null;
    },
    resetPricingPolicyDetail: (state) => {
      state.loading = false;
      state.policy = null;
      state.error = null;
    },
  },
});

export const {
  getPricingPolicyByIdRequest,
  getPricingPolicyByIdSuccess,
  getPricingPolicyByIdFail,
  resetPricingPolicyDetail,
} = getPricingPolicyByIdSlice.actions;

export default getPricingPolicyByIdSlice.reducer;
