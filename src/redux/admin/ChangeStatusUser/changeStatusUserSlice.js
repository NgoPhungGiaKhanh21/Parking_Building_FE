import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  changeStatusUser: [],
  loading: false,
  error: null,
};

const changeStatusUserSlice = createSlice({
  name: "changeStatusUser",

  initialState,

  reducers: {
    changeStatusUserRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    changeStatusUserSuccess: (state, action) => {
      state.loading = false;
      state.changeStatusUser = action.payload;
    },
    changeStatusUserFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  changeStatusUserRequest,
  changeStatusUserSuccess,
  changeStatusUserFail,
} = changeStatusUserSlice.actions;

export default changeStatusUserSlice.reducer;
