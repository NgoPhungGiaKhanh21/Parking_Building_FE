import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  deleteVehicleType: [],
  loading: false,
  error: null,
};

const deleteVehicleTypeSlice = createSlice({
  name: "deleteVehicleType",

  initialState,

  reducers: {
    deleteVehicleTypeRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteVehicleTypeSuccess: (state, action) => {
      state.loading = false;
      state.deleteVehicleType = action.payload;
    },
    deleteVehicleTypeFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  deleteVehicleTypeRequest,
  deleteVehicleTypeSuccess,
  deleteVehicleTypeFail,
} = deleteVehicleTypeSlice.actions;

export default deleteVehicleTypeSlice.reducer;
