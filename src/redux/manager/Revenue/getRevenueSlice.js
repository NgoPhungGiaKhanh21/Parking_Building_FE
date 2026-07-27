import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    getRevenue: null,
    loading: false,
    error: null,
}

const getRevenueSlice = createSlice({
    name: "getRevenue",
    initialState,
    reducers: {
        getRevenueRequest: (state) => {
            state.loading = true;
        },
        getRevenueSuccess: (state, action) => {
            state.loading = false;
            state.getRevenue = action.payload;
        },
        getRevenueFail: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
    }
})

export const { getRevenueRequest, getRevenueSuccess, getRevenueFail } = getRevenueSlice.actions;
export default getRevenueSlice.reducer; 