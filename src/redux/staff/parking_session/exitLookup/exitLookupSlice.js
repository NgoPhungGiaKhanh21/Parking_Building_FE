import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  lookup: null,
  loading: false,
  error: null,
  epoch: 0,
};

/** Staff checkout: plate → ticket-code → ticket lookup (guest + driver walk-in). */
const exitLookupSlice = createSlice({
  name: "exitLookup",
  initialState,
  reducers: {
    exitLookupRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.epoch += 1;
    },
    exitLookupSuccess: (state, action) => {
      const { epoch, lookup } = action.payload;
      state.loading = false;
      if (epoch !== state.epoch) return;
      state.lookup = lookup ?? null;
      state.error = null;
    },
    exitLookupError: (state, action) => {
      const { epoch, error } = action.payload;
      state.loading = false;
      if (epoch !== state.epoch) return;
      state.error = error;
      state.lookup = null;
    },
    exitLookupReset: (state) => {
      state.lookup = null;
      state.loading = false;
      state.error = null;
      state.epoch += 1;
    },
  },
});

export const {
  exitLookupRequest,
  exitLookupSuccess,
  exitLookupError,
  exitLookupReset,
} = exitLookupSlice.actions;

export default exitLookupSlice.reducer;
