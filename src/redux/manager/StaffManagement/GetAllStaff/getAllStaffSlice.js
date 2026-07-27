import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  staffs: [],

  error: null,
};
const getAllStaffSlice = createSlice({
  name: "getAllStaff",
  initialState,
  reducers: {
    getAllStaffRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getAllStaffSuccess: (state, action) => {
      state.loading = false;
      state.staffs = action.payload;
    },
    getAllStaffFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});
export const { getAllStaffRequest, getAllStaffSuccess, getAllStaffFail } =
  getAllStaffSlice.actions;
export default getAllStaffSlice.reducer;
