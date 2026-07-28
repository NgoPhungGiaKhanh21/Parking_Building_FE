import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  getSessionByPlateNumber: null,
  loading: false,
  error: null,
  epoch: 0,
};

const getSessionByPlateNumberSlice = createSlice({
  name: "getSessionByPlateNumber",

  initialState,

  reducers: {
    getSessionByPlateNumberRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.epoch += 1;
    },
    getSessionByPlateNumberSuccess: (state, action) => {
      const { epoch, data } = action.payload;
      state.loading = false;
      if (epoch !== state.epoch) return;
      state.getSessionByPlateNumber = data;
      state.error = null;
    },
    getSessionByPlateNumberError: (state, action) => {
      const { epoch, error } = action.payload;
      state.loading = false;
      if (epoch !== state.epoch) return;
      state.error = error;
    },
    getSessionByPlateNumberReset: (state) => {
      state.getSessionByPlateNumber = null;
      state.loading = false;
      state.error = null;
      state.epoch += 1;
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
