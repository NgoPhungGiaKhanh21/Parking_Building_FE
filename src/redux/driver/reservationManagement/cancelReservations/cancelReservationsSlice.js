import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    cancelReservation: [],
    loading: false,
    error: null,
};

const cancelReservationsSlice = createSlice({
    name: "cancelReservations",
    initialState,
    reducers: {
        cancelReservations: (state) => {
            state.loading = true;
        },
        cancelReservationsSuccess: (state, action) => {
            state.loading = false;
            state.cancelReservation = action.payload;
        },
        cancelReservationsFail: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
    },
});

export const { cancelReservations, cancelReservationsSuccess, cancelReservationsFail } = cancelReservationsSlice.actions;

export default cancelReservationsSlice.reducer;