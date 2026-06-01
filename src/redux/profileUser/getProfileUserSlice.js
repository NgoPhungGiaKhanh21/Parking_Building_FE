import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  getProfileUser: null,
  loading: false,
  error: null,
};

const getProfileUserSlice = createSlice({
  name: "getProfileUser",

  initialState,

  reducers: {
    getProfileUserRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getProfileUserSuccess: (state, action) => {
      state.loading = false;
      state.getProfileUser = action.payload;
    },
    getProfileUserFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  getProfileUserRequest,
  getProfileUserSuccess,
  getProfileUserFail,
} = getProfileUserSlice.actions;

export default getProfileUserSlice.reducer;
