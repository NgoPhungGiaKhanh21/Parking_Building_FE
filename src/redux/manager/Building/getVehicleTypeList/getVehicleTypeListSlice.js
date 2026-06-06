import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  vehicleTypes: [],
  error: null,
};

const getVehicleTypeListSlice = createSlice({
  name: "getVehicleTypeList",
  initialState,
  reducers: {
    getVehicleTypeListRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getVehicleTypeListSuccess: (state, action) => {
      state.loading = false;
      state.vehicleTypes = action.payload;
    },
    getVehicleTypeListFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  getVehicleTypeListRequest,
  getVehicleTypeListSuccess,
  getVehicleTypeListFail,
} = getVehicleTypeListSlice.actions;

export default getVehicleTypeListSlice.reducer;
