import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    floors: [],      // array of floor objects from API
    buildingId: null,
    loading: false,
    error: null,
};

const getBuildingFloorsSlice = createSlice({
    name: "getBuildingFloorsDriver",
    initialState,
    reducers: {
        getBuildingFloorsRequest: (state, action) => {
            state.loading = true;
            state.error = null;
            state.buildingId = action.payload.buildingId;
        },
        getBuildingFloorsSuccess: (state, action) => {
            state.loading = false;
            state.floors = action.payload; // array of floors
        },
        getBuildingFloorsFail: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        getBuildingFloorsReset: (state) => {
            state.floors = [];
            state.buildingId = null;
            state.loading = false;
            state.error = null;
        },
    },
});

export const {
    getBuildingFloorsRequest,
    getBuildingFloorsSuccess,
    getBuildingFloorsFail,
    getBuildingFloorsReset,
} = getBuildingFloorsSlice.actions;

export default getBuildingFloorsSlice.reducer;
