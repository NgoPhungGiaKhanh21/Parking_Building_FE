import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    zoneSlots: null,  // full response data object from API
    slots: [],        // shortcut: data.slots array
    loading: false,
    error: null,
};

const getZoneSlotsSlice = createSlice({
    name: "getZoneSlots",
    initialState,
    reducers: {
        getZoneSlotsRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        getZoneSlotsSuccess: (state, action) => {
            state.loading = false;
            state.zoneSlots = action.payload;
            state.slots = action.payload.slots || [];
        },
        getZoneSlotsFail: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        getZoneSlotsReset: (state) => {
            state.zoneSlots = null;
            state.slots = [];
            state.loading = false;
            state.error = null;
        },
    },
});

export const {
    getZoneSlotsRequest,
    getZoneSlotsSuccess,
    getZoneSlotsFail,
    getZoneSlotsReset,
} = getZoneSlotsSlice.actions;

export default getZoneSlotsSlice.reducer;
