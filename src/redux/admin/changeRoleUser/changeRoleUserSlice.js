import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  changeRoleUser: [],
  loading: false,
  error: null,
};

const changeRoleUserSlice = createSlice({
  name: "changeRoleUser",
  initialState,
  reducers: {
    changeRoleUserRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    changeRoleUserSuccess: (state, action) => {
      state.loading = false;
      state.changeRoleUser = action.payload;
    },
    changeRoleUserFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  changeRoleUserRequest,
  changeRoleUserSuccess,
  changeRoleUserFail,
} = changeRoleUserSlice.actions;
export default changeRoleUserSlice.reducer;
