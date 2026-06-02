import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  getSlotByZone: null,
  error: null,
};

const getSlotByZoneSlice = createSlice({
  name: "getSlotByZone",

  initialState,

  reducers: {
    getSlotByZoneRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getSlotByZoneSuccess: (state, action) => {
      state.loading = false;
      state.getSlotByZone = action.payload;
      state.error = null;
    },
    clearGetSlotByZone: (state) => {
      state.loading = false;
      state.getSlotByZone = null;
      state.error = null;
    },
    getSlotByZoneFail: (state, action) => {
      state.loading = false;
      state.getSlotByZone = null;
      state.error = action.payload;
    },
  },
});

export const {
  getSlotByZoneRequest,
  getSlotByZoneFail,
  getSlotByZoneSuccess,
  clearGetSlotByZone,
} = getSlotByZoneSlice.actions;

export default getSlotByZoneSlice.reducer;
