import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  success: false,
  error: null,
};

const createFloorSlice = createSlice({
  name: "createFloor",
  initialState,
  reducers: {
    createFloorRequest: (state) => {
      state.loading = true;
      state.success = false;
      state.error = null;
    },
    createFloorSuccess: (state) => {
      state.loading = false;
      state.success = true;
    },
    createFloorFail: (state, action) => {
      state.loading = false;
      state.success = false;
      state.error = action.payload;
    },
    resetCreateFloorStatus: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
});

export const {
  createFloorRequest,
  createFloorSuccess,
  createFloorFail,
  resetCreateFloorStatus,
} = createFloorSlice.actions;

export default createFloorSlice.reducer;
