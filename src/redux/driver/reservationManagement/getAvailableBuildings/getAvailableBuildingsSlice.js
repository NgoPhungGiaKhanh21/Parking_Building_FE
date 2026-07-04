import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    buildings: [],
    loading: false,
    error: null,
};

const getAvailableBuildingsSlice = createSlice({
    name: "getAvailableBuildings",
    initialState,
    reducers: {
        getAvailableBuildingsRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        getAvailableBuildingsSuccess: (state, action) => {
            state.loading = false;
            state.buildings = action.payload;
        },
        getAvailableBuildingsFail: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
    },
});

export const {
    getAvailableBuildingsRequest,
    getAvailableBuildingsSuccess,
    getAvailableBuildingsFail,
} = getAvailableBuildingsSlice.actions;

export default getAvailableBuildingsSlice.reducer;
