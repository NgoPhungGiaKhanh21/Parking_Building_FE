import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    createReservation: null,
    loading: false,
    error: null
}

const createReservationsSlice = createSlice({
    name: "createReservation",
    initialState,
    reducers: {
        createReservationsRequest: (state) => {
            state.loading = true;
        },
        createReservationsSuccess: (state, action) => {
            state.loading = false;
            state.createReservation = action.payload;
        },
        createReservationsFail: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        }
    }
})

export const { createReservationsRequest, createReservationsSuccess, createReservationsFail } = createReservationsSlice.actions;
export default createReservationsSlice.reducer;