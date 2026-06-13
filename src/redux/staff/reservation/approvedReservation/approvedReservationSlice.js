import { createSlice } from "@reduxjs/toolkit";
import { approveReservationApi } from "../../../../service/staff/reservationApi";

const initialState = {
    approvedReservation: [],
    loading: false,
    error: null,
}

const approvedReservationSlice = createSlice({
    name: "approvedReservation",
    initialState,
    reducers: {
        approveReservationRequest: (state) => {
            state.loading = true;
        },
        approveReservationSuccess: (state, action) => {
            state.loading = false;
            state.approvedReservation = action.payload;
        },
        approveReservationFail: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
    },
})

export const {
    approveReservationRequest,
    approveReservationSuccess,
    approveReservationFail
} = approvedReservationSlice.actions

export default approvedReservationSlice.reducer