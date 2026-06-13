import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    getAllReservation: null,
    loading: false,
    error: null,
}

const getAllReservationSlice = createSlice({
    name: "getAllReservation",
    initialState,
    reducers: {
        getAllReservationRequest: (state) => {
            state.loading = true;
        },
        getAllReservationSuccess: (state, action) => {
            state.loading = false;
            state.getAllReservation = action.payload;
        },
        getAllReservationFail: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        }
    }
})

export const { getAllReservationRequest, getAllReservationSuccess, getAllReservationFail } = getAllReservationSlice.actions;

export default getAllReservationSlice.reducer;