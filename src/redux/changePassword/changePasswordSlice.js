import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  changePassword: [],
  loading: false,
  error: null,
};

const changePasswordSlice = createSlice({
  name: "changePassword",

  initialState,

  reducers: {
    changePasswordRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    changePasswordSuccess: (state, action) => {
      state.loading = false;
      state.changePassword = action.payload;
    },
    changePasswordFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  changePasswordRequest,
  changePasswordSuccess,
  changePasswordFail,
} = changePasswordSlice.actions;

export default changePasswordSlice.reducer;
