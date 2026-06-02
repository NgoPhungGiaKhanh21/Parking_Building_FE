import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  vehicleTypes: [],
  error: null,
};

const getVehicleTypesSlice = createSlice({
  name: "getVehicleTypes",
  initialState,
  reducers: {
    getVehicleTypesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getVehicleTypesSuccess: (state, action) => {
      state.loading = false;
      state.vehicleTypes = action.payload;
    },
    getVehicleTypesFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.vehicleTypes = [];
    },
  },
});

export const {
  getVehicleTypesRequest,
  getVehicleTypesSuccess,
  getVehicleTypesFail,
} = getVehicleTypesSlice.actions;

export default getVehicleTypesSlice.reducer;
