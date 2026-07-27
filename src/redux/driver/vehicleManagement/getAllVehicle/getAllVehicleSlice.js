import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  getAllVehicles: null,
  loading: false,
  error: null,
};

const getAllVehicleSlice = createSlice({
  name: "getAllVehicle",

  initialState,

  reducers: {
    getAllVehicleRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getAllVehicleSuccess: (state, action) => {
      state.loading = false;
      state.getAllVehicles = action.payload;
    },
    getAllVehicleFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { getAllVehicleRequest, getAllVehicleSuccess, getAllVehicleFail } =
  getAllVehicleSlice.actions;

export default getAllVehicleSlice.reducer;
