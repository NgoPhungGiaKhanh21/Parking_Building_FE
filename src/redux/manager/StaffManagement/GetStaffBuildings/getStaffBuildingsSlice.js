import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  buildings: [],
  userId: null,
  error: null,
};

const getStaffBuildingsSlice = createSlice({
  name: "getStaffBuildings",
  initialState,
  reducers: {
    getStaffBuildingsRequest: (state, action) => {
      state.loading = true;
      state.error = null;
      state.userId = action.payload;
    },
    getStaffBuildingsSuccess: (state, action) => {
      state.loading = false;
      state.buildings = action.payload;
    },
    getStaffBuildingsFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.buildings = [];
    },
    resetStaffBuildings: (state) => {
      state.loading = false;
      state.buildings = [];
      state.userId = null;
      state.error = null;
    },
  },
});

export const {
  getStaffBuildingsRequest,
  getStaffBuildingsSuccess,
  getStaffBuildingsFail,
  resetStaffBuildings,
} = getStaffBuildingsSlice.actions;

export default getStaffBuildingsSlice.reducer;
