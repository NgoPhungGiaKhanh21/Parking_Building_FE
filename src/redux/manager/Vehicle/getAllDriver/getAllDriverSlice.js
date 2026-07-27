import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  getAllDriver: null,
  error: null,
};

const getAllDriverSlice = createSlice({
  name: "getAllDriver",
  initialState,
  reducers: {
    getAllDriverRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getAllDriverSuccess: (state, action) => {
      state.loading = false;
      state.getAllDriver = action.payload;
      state.error = null;
    },
    getAllDriverFail: (state, action) => {
      state.loading = false;
      state.getAllDriver = null;
      state.error = action.payload;
    },
  },
});

export const { getAllDriverRequest, getAllDriverFail, getAllDriverSuccess } =
  getAllDriverSlice.actions;

export default getAllDriverSlice.reducer;
