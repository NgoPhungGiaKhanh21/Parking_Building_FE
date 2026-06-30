import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  stats: null,
  loading: false,
  error: null,
};

const getAdminDashboardStatsSlice = createSlice({
  name: "getAdminDashboardStats",
  initialState,
  reducers: {
    getAdminDashboardStatsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getAdminDashboardStatsSuccess: (state, action) => {
      state.loading = false;
      state.stats = action.payload;
    },
    getAdminDashboardStatsFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  getAdminDashboardStatsRequest,
  getAdminDashboardStatsSuccess,
  getAdminDashboardStatsFail,
} = getAdminDashboardStatsSlice.actions;

export default getAdminDashboardStatsSlice.reducer;

