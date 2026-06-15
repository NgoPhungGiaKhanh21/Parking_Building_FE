import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    getAllVehicleManager: null,
    loading: false,
    error: null
}

const getAllVehicleSlice = createSlice({
    name: "getAllVehicleManager",
    initialState,
    reducers: {
        getAllVehicleRequest: (state) => {
            state.loading = true;
        },
        getAllVehicleSuccess: (state, action) => {
            state.loading = false;
            state.getAllVehicleManager = action.payload;
        },
        getAllVehicleFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        }
    }
})

export const { getAllVehicleRequest, getAllVehicleSuccess, getAllVehicleFailure } = getAllVehicleSlice.actions;
export default getAllVehicleSlice.reducer;
