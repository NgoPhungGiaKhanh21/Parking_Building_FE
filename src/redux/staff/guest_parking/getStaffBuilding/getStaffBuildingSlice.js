import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    getStaffBuilding: null,
    loading: false,
    error: null
};

const getStaffBuildingSlice = createSlice({
    name: "getStaffBuilding",
    initialState,
    reducers: {
        getStaffBuildingRequest: (state) => {
            state.loading = true;
        },
        getStaffBuildingSuccess: (state, action) => {
            state.loading = false;
            state.getStaffBuilding = action.payload;
        },
        getStaffBuildingFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        }
    }
});

export const { getStaffBuildingRequest, getStaffBuildingSuccess, getStaffBuildingFailure } = getStaffBuildingSlice.actions;

export default getStaffBuildingSlice.reducer;