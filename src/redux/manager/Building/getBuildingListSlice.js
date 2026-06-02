import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  buildings: [],
  error: null,
};

const getBuildingListSlice = createSlice({
  name: "getBuildingList",
  initialState,
  reducers: {
    getBuildingListRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getBuildingListSuccess: (state, action) => {
      state.loading = false;
      state.buildings = action.payload;
    },
    getBuildingListFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  getBuildingListRequest,
  getBuildingListSuccess,
  getBuildingListFail,
} = getBuildingListSlice.actions;

export default getBuildingListSlice.reducer;
