import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  updateZoneStatus: [],
  loading: false,
  error: null,
};

const updateZoneStatusSlice = createSlice({
  name: "updateZoneStatus",

  initialState,

  reducers: {
    updateZoneStatusRequest: (state) => {
      state.loading = true;
      state.error = null;
    },

    updateZoneStatusSuccess: (state, action) => {
      state.loading = false;
      state.updateZoneStatus = action.payload;
    },

    updateZoneStatusFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  updateZoneStatusRequest,
  updateZoneStatusSuccess,
  updateZoneStatusFail,
} = updateZoneStatusSlice.actions;

export default updateZoneStatusSlice.reducer;
