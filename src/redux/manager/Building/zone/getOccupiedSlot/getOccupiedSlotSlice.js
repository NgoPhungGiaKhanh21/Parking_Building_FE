import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    getOccupiedSlot: null,
    error: null,
    loading: false
}

const getOccupiedSlotSlice = createSlice({
    name: "getOccupiedSlot",
    initialState,
    reducers: {
        getOccupiedSlotRequest: (state) => {
            state.loading = true
        },
        getOccupiedSlotSuccess: (state, action) => {
            state.loading = false
            state.getOccupiedSlot = action.payload
        },
        getOccupiedSlotFail: (state, action) => {
            state.loading = false
            state.error = action.payload
        },
        clearGetOccupiedSlot: (state) => {
            state.getOccupiedSlot = null;
            state.error = null;
            state.loading = false;
        }
    }
})

export const { getOccupiedSlotRequest, getOccupiedSlotSuccess, getOccupiedSlotFail, clearGetOccupiedSlot } = getOccupiedSlotSlice.actions
export default getOccupiedSlotSlice.reducer
