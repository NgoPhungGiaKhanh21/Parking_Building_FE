import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  floors: [],
  error: null,
};

const getBuildingFloorsSlice = createSlice({
  name: "getBuildingFloors",
  initialState,
  reducers: {
    getBuildingFloorsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getBuildingFloorsSuccess: (state, action) => {
      state.loading = false;
      state.floors = action.payload;
    },
    getBuildingFloorsFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.floors = [];
    },
    resetBuildingFloors: (state) => {
      state.loading = false;
      state.error = null;
      state.floors = [];
    },
  },
});

export const {
  getBuildingFloorsRequest,
  getBuildingFloorsSuccess,
  getBuildingFloorsFail,
  resetBuildingFloors,
} = getBuildingFloorsSlice.actions;

export default getBuildingFloorsSlice.reducer;
