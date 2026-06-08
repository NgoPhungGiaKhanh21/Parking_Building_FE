import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  updatingBuildingId: null,
  error: null,
};

const updateBuildingStatusSlice = createSlice({
  name: "updateBuildingStatus",
  initialState,
  reducers: {
    updateBuildingStatusRequest: (state, action) => {
      state.loading = true;
      state.updatingBuildingId = action.payload?.buildingId ?? null;
      state.error = null;
    },
    updateBuildingStatusSuccess: (state) => {
      state.loading = false;
      state.updatingBuildingId = null;
    },
    updateBuildingStatusFail: (state, action) => {
      state.loading = false;
      state.updatingBuildingId = null;
      state.error = action.payload;
    },
  },
});

export const {
  updateBuildingStatusRequest,
  updateBuildingStatusSuccess,
  updateBuildingStatusFail,
} = updateBuildingStatusSlice.actions;

export default updateBuildingStatusSlice.reducer;
