import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  getVehicleManage: null,
  error: null,
};

const getVehicleManageSlice = createSlice({
  name: "getVehicleManage",
  initialState,
  reducers: {
    getVehicleManageRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getVehicleManageSuccess: (state, action) => {
      state.loading = false;
      state.getVehicleManage = action.payload;
      state.error = null;
    },
    getVehicleManageFail: (state, action) => {
      state.loading = false;
      state.getVehicleManage = null;
      state.error = action.payload;
    },
  },
});

export const {
  getVehicleManageRequest,
  getVehicleManageFail,
  getVehicleManageSuccess,
} = getVehicleManageSlice.actions;

export default getVehicleManageSlice.reducer;
