import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  createVehicle: null,
  loading: false,
  error: null,
};

const createVehicleSlice = createSlice({
  name: "createVehicle",

  initialState,

  reducers: {
    createVehicleRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    createVehicleSuccess: (state, action) => {
      state.loading = false;
      state.createVehicle = action.payload;
    },
    createVehicleFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { createVehicleRequest, createVehicleSuccess, createVehicleFail } =
  createVehicleSlice.actions;

export default createVehicleSlice.reducer;
