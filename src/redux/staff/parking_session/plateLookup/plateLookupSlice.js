import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  result: null,
  loading: false,
  error: null,
  epoch: 0,
};

const plateLookupSlice = createSlice({
  name: "plateLookup",
  initialState,
  reducers: {
    plateLookupRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.epoch += 1;
    },
    plateLookupSuccess: (state, action) => {
      const { epoch, data } = action.payload;
      state.loading = false;
      if (epoch !== state.epoch) return;
      state.result = data;
      state.error = null;
    },
    plateLookupError: (state, action) => {
      const { epoch, error } = action.payload;
      state.loading = false;
      if (epoch !== state.epoch) return;
      state.error = error;
      state.result = null;
    },
    plateLookupReset: (state) => {
      state.result = null;
      state.loading = false;
      state.error = null;
      state.epoch += 1;
    },
  },
});

export const {
  plateLookupRequest,
  plateLookupSuccess,
  plateLookupError,
  plateLookupReset,
} = plateLookupSlice.actions;

export default plateLookupSlice.reducer;
