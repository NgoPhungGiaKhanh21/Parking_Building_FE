import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    updateZone: [],
    loading: false,
    error: null,
    success: false,
}

const updateZoneSlice = createSlice({
    name: "updateZone",
    initialState,
    reducers: {
        updateZoneRequest: (state) => {
            state.loading = true;
            state.success = false;
        },
        updateZoneSuccess: (state, action) => {
            state.loading = false;
            state.updateZone = action.payload;
            state.success = true;
        },
        updateZoneFail: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.success = false;
        },
        resetUpdateZoneStatus: (state) => {
            state.success = false;
            state.error = null;
        }
    }
})

export const { updateZoneRequest, updateZoneSuccess, updateZoneFail, resetUpdateZoneStatus } = updateZoneSlice.actions;
export default updateZoneSlice.reducer;
