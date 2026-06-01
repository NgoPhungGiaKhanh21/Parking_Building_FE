import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  updateProfileUser: [],
  loading: false,
  error: null,
};

const updateProfileUserSlice = createSlice({
  name: "updateProfileUser",

  initialState,

  reducers: {
    updateProfileUserRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateProfileUserSuccess: (state, action) => {
      state.loading = false;
      state.updateProfileUser = action.payload;
    },
    updateProfileUserFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  updateProfileUserRequest,
  updateProfileUserSuccess,
  updateProfileUserFail,
} = updateProfileUserSlice.actions;

export default updateProfileUserSlice.reducer;
