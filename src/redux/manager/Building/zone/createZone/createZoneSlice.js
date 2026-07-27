import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  success: false,
  error: null,
};

const createZoneSlice = createSlice({
  name: "createZone",
  initialState,
  reducers: {
    createZoneRequest: (state) => {
      state.loading = true;
      state.success = false;
      state.error = null;
    },
    createZoneSuccess: (state) => {
      state.loading = false;
      state.success = true;
    },
    createZoneFail: (state, action) => {
      state.loading = false;
      state.success = false;
      state.error = action.payload;
    },
    resetCreateZoneStatus: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
});

export const {
  createZoneRequest,
  createZoneSuccess,
  createZoneFail,
  resetCreateZoneStatus,
} = createZoneSlice.actions;

export default createZoneSlice.reducer;
