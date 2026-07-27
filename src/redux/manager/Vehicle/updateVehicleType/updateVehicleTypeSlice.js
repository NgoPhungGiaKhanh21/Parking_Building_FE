import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  updateVehicleType: [],
  loading: false,
  error: null,
};

const updateVehicleTypeSlice = createSlice({
  name: "updateVehicleType",
  initialState,
  reducers: {
    updateVehicleTypeRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateVehicleTypeSuccess: (state, action) => {
      state.loading = false;
      state.updateVehicleType = action.payload;
    },
    updateVehicleTypeFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  updateVehicleTypeRequest,
  updateVehicleTypeFail,
  updateVehicleTypeSuccess,
} = updateVehicleTypeSlice.actions;

export default updateVehicleTypeSlice.reducer;
