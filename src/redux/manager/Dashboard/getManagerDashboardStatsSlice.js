import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  stats: null,
  loading: false,
  error: null,
};

const getManagerDashboardStatsSlice = createSlice({
  name: "getManagerDashboardStats",
  initialState,
  reducers: {
    getManagerDashboardStatsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getManagerDashboardStatsSuccess: (state, action) => {
      state.loading = false;
      state.stats = action.payload;
    },
    getManagerDashboardStatsFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  getManagerDashboardStatsRequest,
  getManagerDashboardStatsSuccess,
  getManagerDashboardStatsFail,
} = getManagerDashboardStatsSlice.actions;

export default getManagerDashboardStatsSlice.reducer;
