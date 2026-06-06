import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  buildingDetail: null,
  error: null,
};

const getBuildingDetailSlice = createSlice({
  name: "getBuildingDetail",
  initialState,
  reducers: {
    getBuildingDetailRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getBuildingDetailSuccess: (state, action) => {
      state.loading = false;
      state.buildingDetail = action.payload;
    },
    getBuildingDetailFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.buildingDetail = null;
    },
    resetBuildingDetail: (state) => {
      state.loading = false;
      state.error = null;
      state.buildingDetail = null;
    },
  },
});

export const {
  getBuildingDetailRequest,
  getBuildingDetailSuccess,
  getBuildingDetailFail,
  resetBuildingDetail,
} = getBuildingDetailSlice.actions;

export default getBuildingDetailSlice.reducer;
