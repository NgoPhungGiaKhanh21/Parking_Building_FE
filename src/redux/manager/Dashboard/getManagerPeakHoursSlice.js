import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  peakHours: null,
  loading: false,
  error: null,
};

const getManagerPeakHoursSlice = createSlice({
  name: "getManagerPeakHours",
  initialState,
  reducers: {
    getManagerPeakHoursRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getManagerPeakHoursSuccess: (state, action) => {
      state.loading = false;
      state.peakHours = action.payload;
    },
    getManagerPeakHoursFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  getManagerPeakHoursRequest,
  getManagerPeakHoursSuccess,
  getManagerPeakHoursFail,
} = getManagerPeakHoursSlice.actions;

export default getManagerPeakHoursSlice.reducer;
