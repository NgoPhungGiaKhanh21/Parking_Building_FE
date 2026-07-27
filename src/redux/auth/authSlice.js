import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  registerSuccess: false,
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    loginRequest: (state) => {
      state.loading = true;
      state.error = null;
    },

    loginSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
    },

    loginFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    registerRequest: (state) => {
      state.loading = true;
      state.error = null;
    },

    registerSuccess: (state) => {
      state.loading = false;
      state.registerSuccess = true;
    },

    registerFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Thêm reducer này để reset trạng thái đăng ký
    resetRegisterState: (state) => {
      state.registerSuccess = false;
    },
  },
});

export const {
  loginRequest,
  loginSuccess,
  loginFail,
  registerRequest,
  registerSuccess,
  registerFail,
  resetRegisterState,
} = authSlice.actions;

export default authSlice.reducer;
