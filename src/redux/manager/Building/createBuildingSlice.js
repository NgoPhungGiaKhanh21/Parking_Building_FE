import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  success: false,
  error: null,
};
const createBuildingSlice = createSlice({
  name: "createBuilding",

  initialState,

  reducers: {
    createBuildingRequest: (state) => {
      state.loading = true;
      state.success = false;
      state.error = null;
    },
    createBuildingSuccess: (state) => {
      state.loading = false;
      state.success = true;
    },
    createBuildingFail: (state, action) => {
      state.loading = false;
      state.success = false;
      state.error = action.payload;
    },
    resetCreateBuildingStatus: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
});

export const {
  createBuildingRequest,
  createBuildingSuccess,
  createBuildingFail,
  resetCreateBuildingStatus,
} = createBuildingSlice.actions;

export default createBuildingSlice.reducer;
