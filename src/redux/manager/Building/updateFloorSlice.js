import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  success: false,
  error: null,
};

const updateFloorSlice = createSlice({
  name: "updateFloor",
  initialState,
  reducers: {
    updateFloorRequest: (state) => {
      state.loading = true;
      state.success = false;
      state.error = null;
    },
    updateFloorSuccess: (state) => {
      state.loading = false;
      state.success = true;
    },
    updateFloorFail: (state, action) => {
      state.loading = false;
      state.success = false;
      state.error = action.payload;
    },
    resetUpdateFloorStatus: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
});

export const {
  updateFloorRequest,
  updateFloorSuccess,
  updateFloorFail,
  resetUpdateFloorStatus,
} = updateFloorSlice.actions;

export default updateFloorSlice.reducer;
