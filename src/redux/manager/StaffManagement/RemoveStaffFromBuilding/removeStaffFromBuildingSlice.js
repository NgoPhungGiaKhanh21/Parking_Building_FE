import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  success: false,
  error: null,
};

const removeStaffFromBuildingSlice = createSlice({
  name: "removeStaffFromBuilding",
  initialState,
  reducers: {
    removeStaffFromBuildingRequest: (state) => {
      state.loading = true;
      state.success = false;
      state.error = null;
    },
    removeStaffFromBuildingSuccess: (state) => {
      state.loading = false;
      state.success = true;
    },
    removeStaffFromBuildingFail: (state, action) => {
      state.loading = false;
      state.success = false;
      state.error = action.payload;
    },
    resetRemoveStaffFromBuildingStatus: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
});

export const {
  removeStaffFromBuildingRequest,
  removeStaffFromBuildingSuccess,
  removeStaffFromBuildingFail,
  resetRemoveStaffFromBuildingStatus,
} = removeStaffFromBuildingSlice.actions;

export default removeStaffFromBuildingSlice.reducer;
