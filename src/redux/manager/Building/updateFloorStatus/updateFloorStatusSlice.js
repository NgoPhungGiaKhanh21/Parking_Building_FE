import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  updatingFloorId: null,
  error: null,
};

const updateFloorStatusSlice = createSlice({
  name: "updateFloorStatus",
  initialState,
  reducers: {
    updateFloorStatusRequest: (state, action) => {
      state.loading = true;
      state.updatingFloorId = action.payload?.floorId ?? null;
      state.error = null;
    },
    updateFloorStatusSuccess: (state) => {
      state.loading = false;
      state.updatingFloorId = null;
    },
    updateFloorStatusFail: (state, action) => {
      state.loading = false;
      state.updatingFloorId = null;
      state.error = action.payload;
    },
  },
});

export const {
  updateFloorStatusRequest,
  updateFloorStatusSuccess,
  updateFloorStatusFail,
} = updateFloorStatusSlice.actions;

export default updateFloorStatusSlice.reducer;
