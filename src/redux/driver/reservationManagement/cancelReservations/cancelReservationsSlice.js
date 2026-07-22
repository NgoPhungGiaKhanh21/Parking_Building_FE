import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    cancelReservation: null,
    loading: false,
    error: null,
};

const cancelReservationsSlice = createSlice({
    name: "cancelReservations",
    initialState,
    reducers: {
        cancelReservations: (state) => {
            state.loading = true;
            state.error = null;
        },
        cancelReservationsSuccess: (state, action) => {
            state.loading = false;
            state.error = null;
            state.cancelReservation = action.payload;
        },
        cancelReservationsFail: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        cancelReservationsReset: () => initialState,
    },
});

export const {
    cancelReservations,
    cancelReservationsSuccess,
    cancelReservationsFail,
    cancelReservationsReset,
} = cancelReservationsSlice.actions;

export default cancelReservationsSlice.reducer;