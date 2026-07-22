import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  peakHours: null,
  loading: false,
  error: null,
};

const getBuildingPeakHoursSlice = createSlice({
  name: "getBuildingPeakHours",
  initialState,
  reducers: {
    getBuildingPeakHoursRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getBuildingPeakHoursSuccess: (state, action) => {
      state.loading = false;
      state.peakHours = action.payload;
    },
    getBuildingPeakHoursFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    getBuildingPeakHoursReset: () => initialState,
  },
});

export const {
  getBuildingPeakHoursRequest,
  getBuildingPeakHoursSuccess,
  getBuildingPeakHoursFail,
  getBuildingPeakHoursReset,
} = getBuildingPeakHoursSlice.actions;

export default getBuildingPeakHoursSlice.reducer;
