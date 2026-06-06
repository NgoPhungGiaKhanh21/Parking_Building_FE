import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  staffs: [],
  buildingId: null,
  error: null,
};

const getBuildingStaffSlice = createSlice({
  name: "getBuildingStaff",
  initialState,
  reducers: {
    getBuildingStaffRequest: (state, action) => {
      state.loading = true;
      state.error = null;
      state.buildingId = action.payload;
    },
    getBuildingStaffSuccess: (state, action) => {
      state.loading = false;
      state.staffs = action.payload;
    },
    getBuildingStaffFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.staffs = [];
    },
    resetBuildingStaff: (state) => {
      state.loading = false;
      state.staffs = [];
      state.buildingId = null;
      state.error = null;
    },
  },
});

export const {
  getBuildingStaffRequest,
  getBuildingStaffSuccess,
  getBuildingStaffFail,
  resetBuildingStaff,
} = getBuildingStaffSlice.actions;

export default getBuildingStaffSlice.reducer;
