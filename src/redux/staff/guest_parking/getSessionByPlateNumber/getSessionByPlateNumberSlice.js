import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  getSessionByPlateNumber: null,
  loading: false,
  error: null,
};

const getSessionByPlateNumberSlice = createSlice({
  name: "getSessionByPlateNumber",

  initialState,

  reducers: {
    getSessionByPlateNumberRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getSessionByPlateNumberSuccess: (state, action) => {
      state.loading = false;
      state.getSessionByPlateNumber = action.payload;
    },
    getSessionByPlateNumberError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    getSessionByPlateNumberReset: (state) => {
      state.getSessionByPlateNumber = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  getSessionByPlateNumberRequest,
  getSessionByPlateNumberError,
  getSessionByPlateNumberSuccess,
  getSessionByPlateNumberReset,
} = getSessionByPlateNumberSlice.actions;

export default getSessionByPlateNumberSlice.reducer;
