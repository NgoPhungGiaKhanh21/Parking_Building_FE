import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  success: false,
  error: null,
};
const assignStaffSlice = createSlice({
  name: "assignStaff",
  initialState,
  reducers: {
    assignStaffRequest: (state) => {
      state.loading = true;
      state.success = false;
      state.error = null;
    },
    assignStaffSuccess: (state) => {
      state.loading = false;
      state.success = true;
    },
    assignStaffFail: (state, action) => {
      state.loading = false;
      state.success = false;
      state.error = action.payload;
    },
    resetAssignStaffStatus: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
});
export const {
  assignStaffRequest,
  assignStaffSuccess,
  assignStaffFail,
  resetAssignStaffStatus,
} = assignStaffSlice.actions;
export default assignStaffSlice.reducer;
