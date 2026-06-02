import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  getAllVehicleType: null,
  loading: false,
  error: null,
};

const getAllVehicleTypeSlice = createSlice({
  name: "getAllVehicleType",

  initialState,

  reducers: {
    getAllVehicleTypeRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getAllVehicleTypeSuccess: (state, action) => {
      state.loading = false;
      state.getAllVehicleType = action.payload;
    },
    getAllVehicleTypeFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  getAllVehicleTypeRequest,
  getAllVehicleTypeSuccess,
  getAllVehicleTypeFail,
} = getAllVehicleTypeSlice.actions;

export default getAllVehicleTypeSlice.reducer;
