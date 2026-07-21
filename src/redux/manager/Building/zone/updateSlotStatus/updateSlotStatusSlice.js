import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  updatingSlotId: null,
  error: null,
};

const updateSlotStatusSlice = createSlice({
  name: "updateSlotStatus",
  initialState,
  reducers: {
    updateSlotStatusRequest: (state, action) => {
      state.loading = true;
      state.updatingSlotId = action.payload?.slotId ?? null;
      state.error = null;
    },
    updateSlotStatusSuccess: (state) => {
      state.loading = false;
      state.updatingSlotId = null;
    },
    updateSlotStatusFail: (state, action) => {
      state.loading = false;
      state.updatingSlotId = null;
      state.error = action.payload;
    },
  },
});

export const {
  updateSlotStatusRequest,
  updateSlotStatusSuccess,
  updateSlotStatusFail,
} = updateSlotStatusSlice.actions;

export default updateSlotStatusSlice.reducer;
