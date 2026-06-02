import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  success: false,
  error: null,
};

const createBuildingFloorSlice = createSlice({
  name: "createBuildingFloor",
  initialState,
  reducers: {
    createBuildingFloorRequest: (state) => {
      state.loading = true;
      state.success = false;
      state.error = null;
    },
    createBuildingFloorSuccess: (state) => {
      state.loading = false;
      state.success = true;
    },
    createBuildingFloorFail: (state, action) => {
      state.loading = false;
      state.success = false;
      state.error = action.payload;
    },
    resetCreateBuildingFloorStatus: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
});

export const {
  createBuildingFloorRequest,
  createBuildingFloorSuccess,
  createBuildingFloorFail,
  resetCreateBuildingFloorStatus,
} = createBuildingFloorSlice.actions;

export default createBuildingFloorSlice.reducer;
