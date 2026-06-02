import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  getZoneByFloor: null,
  error: null,
};

const getZoneByFloorSlice = createSlice({
  name: "getZoneByFloor",
  initialState,
  reducers: {
    getZoneByFloorRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getZoneByFloorSuccess: (state, action) => {
      state.loading = false;
      state.getZoneByFloor = action.payload;
      state.error = null;
    },
    getZoneByFloorFail: (state, action) => {
      state.loading = false;
      state.getZoneByFloor = null;
      state.error = action.payload;
    },
  },
});

export const {
  getZoneByFloorRequest,
  getZoneByFloorSuccess,
  getZoneByFloorFail,
} = getZoneByFloorSlice.actions;

export default getZoneByFloorSlice.reducer;
