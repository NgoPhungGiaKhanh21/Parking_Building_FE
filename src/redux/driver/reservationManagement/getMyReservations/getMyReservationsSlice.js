import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    myReservations: null,
    loading: false,
    error: null
}

const getMyReservationsSlice = createSlice({
    name: "getMyReservations",
    initialState,
    reducers: {
        getMyReservationsRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        getMyReservationsSuccess: (state, action) => {
            state.loading = false;
            state.myReservations = action.payload;
        },
        getMyReservationsFail: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        }
    }
})

export const { getMyReservationsRequest, getMyReservationsSuccess, getMyReservationsFail } = getMyReservationsSlice.actions;
export default getMyReservationsSlice.reducer;
