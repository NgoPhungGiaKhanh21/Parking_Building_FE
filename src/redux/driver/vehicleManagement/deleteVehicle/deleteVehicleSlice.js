import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  deleteVehicle: [],
  loading: false,
  error: null,
};

const deleteVehicleSlice = createSlice({
  name: "deleteVehicle",

  initialState,

  reducers: {
    deleteVehicleRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteVehicleSuccess: (state, action) => {
      state.loading = false;
      state.deleteVehicle = action.payload;
    },
    deleteVehicleFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { deleteVehicleRequest, deleteVehicleSuccess, deleteVehicleFail } =
  deleteVehicleSlice.actions;

export default deleteVehicleSlice.reducer;
