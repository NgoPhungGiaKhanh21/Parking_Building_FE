import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  createVehicleType: null,
  loading: false,
  error: null,
};

const createVehicleTypeSlice = createSlice({
  name: "createVehicleType",

  initialState,

  reducers: {
    createVehicleTypeRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    createVehicleTypeSuccess: (state, action) => {
      state.loading = false;
      state.createVehicleType = action.payload;
    },
    createVehicleTypeFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  createVehicleTypeFail,
  createVehicleTypeRequest,
  createVehicleTypeSuccess,
} = createVehicleTypeSlice.actions;

export default createVehicleTypeSlice.reducer;
