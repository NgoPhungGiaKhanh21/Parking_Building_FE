import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  unifiedCheckin: null,
  loading: false,
  error: null,
};

const unifiedCheckinSlice = createSlice({
  name: "unifiedCheckin",
  initialState,
  reducers: {
    unifiedCheckinRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.unifiedCheckin = null;
    },
    unifiedCheckinSuccess: (state, action) => {
      state.loading = false;
      state.unifiedCheckin = action.payload;
    },
    unifiedCheckinFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    unifiedCheckinReset: (state) => {
      state.loading = false;
      state.error = null;
      state.unifiedCheckin = null;
    },
  },
});

export const {
  unifiedCheckinRequest,
  unifiedCheckinSuccess,
  unifiedCheckinFail,
  unifiedCheckinReset,
} = unifiedCheckinSlice.actions;

export default unifiedCheckinSlice.reducer;
