import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  changeStatusVehicle: [],
  loading: false,
  error: null,
};

const changeStatusVehicleSlice = createSlice({
  name: "changeStatusVehicle",
  initialState,
  reducers: {
    changeStatusVehicleRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    changeStatusVehicleSuccess: (state, action) => {
      state.loading = false;
      state.changeStatusVehicle = action.payload;
      state.error = null;
    },
    changeStatusVehicleFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  changeStatusVehicleFail,
  changeStatusVehicleRequest,
  changeStatusVehicleSuccess,
} = changeStatusVehicleSlice.actions;

export default changeStatusVehicleSlice.reducer;
