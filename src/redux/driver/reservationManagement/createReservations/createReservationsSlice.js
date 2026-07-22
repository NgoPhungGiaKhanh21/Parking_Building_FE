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
            state.error = null;
            state.createReservation = null;
        },
        createReservationsSuccess: (state, action) => {
            state.loading = false;
            state.error = null;
            state.createReservation = action.payload;
        },
        createReservationsFail: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.createReservation = null;
        },
        createReservationsReset: () => initialState,
    }
})

export const {
    createReservationsRequest,
    createReservationsSuccess,
    createReservationsFail,
    createReservationsReset,
} = createReservationsSlice.actions;
export default createReservationsSlice.reducer;