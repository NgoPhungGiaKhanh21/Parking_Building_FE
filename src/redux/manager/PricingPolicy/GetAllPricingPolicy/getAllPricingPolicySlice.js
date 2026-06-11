import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  policies: [],
  error: null,
};

const getAllPricingPolicySlice = createSlice({
  name: "getAllPricingPolicy",
  initialState,
  reducers: {
    getAllPricingPolicyRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getAllPricingPolicySuccess: (state, action) => {
      state.loading = false;
      state.policies = action.payload;
    },
    getAllPricingPolicyFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.policies = [];
    },
  },
});

export const {
  getAllPricingPolicyRequest,
  getAllPricingPolicySuccess,
  getAllPricingPolicyFail,
} = getAllPricingPolicySlice.actions;

export default getAllPricingPolicySlice.reducer;
