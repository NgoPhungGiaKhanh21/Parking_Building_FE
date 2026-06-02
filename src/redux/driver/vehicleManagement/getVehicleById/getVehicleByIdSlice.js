import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  getVehicleById: null,
  loading: false,
  error: null,
};

const getVehicleByIdSlice = createSlice({
  name: "getVehicleById",

  initialState,

  reducers: {
    getVehicleByIdRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getVehicleByIdSuccess: (state, action) => {
      state.loading = false;
      state.getVehicleById = action.payload;
    },
    getVehicleByIdFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  getVehicleByIdRequest,
  getVehicleByIdSuccess,
  getVehicleByIdFail,
} = getVehicleByIdSlice.actions;

export default getVehicleByIdSlice.reducer;
