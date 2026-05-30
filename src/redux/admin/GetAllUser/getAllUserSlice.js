import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  getAllUser: null,
  loading: false,
  error: null,
};

const getAllUserSlice = createSlice({
  name: "getAllUser",

  initialState,

  reducers: {
    getAllUserRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getAllUserSuccess: (state, action) => {
      state.loading = false;
      state.getAllUser = action.payload;
    },
    getAllUserFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { getAllUserRequest, getAllUserSuccess, getAllUserFail } =
  getAllUserSlice.actions;

export default getAllUserSlice.reducer;
