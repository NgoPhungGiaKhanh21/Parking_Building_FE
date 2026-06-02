import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  updateVehicle: [],
  loading: false,
  error: null,
};

const updateVehicleSlice = createSlice({
  name: "updateVehicle",

  initialState,

  reducers: {
    updateVehicleRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateVehicleSuccess: (state, action) => {
      state.loading = false;
      state.updateVehicle = action.payload;
    },
    updateVehicleFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { updateVehicleRequest, updateVehicleSuccess, updateVehicleFail } =
  updateVehicleSlice.actions;

export default updateVehicleSlice.reducer;
