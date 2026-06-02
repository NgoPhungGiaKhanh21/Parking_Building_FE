import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  success: false,
  error: null,
};

const updateBuildingSlice = createSlice({
  name: "updateBuilding",
  initialState,
  reducers: {
    updateBuildingRequest: (state) => {
      state.loading = true;
      state.success = false;
      state.error = null;
    },
    updateBuildingSuccess: (state) => {
      state.loading = false;
      state.success = true;
    },
    updateBuildingFail: (state, action) => {
      state.loading = false;
      state.success = false;
      state.error = action.payload;
    },
    resetUpdateBuildingStatus: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
});

export const {
  updateBuildingRequest,
  updateBuildingSuccess,
  updateBuildingFail,
  resetUpdateBuildingStatus,
} = updateBuildingSlice.actions;

export default updateBuildingSlice.reducer;
