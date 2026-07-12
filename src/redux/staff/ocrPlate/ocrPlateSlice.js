import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    ocrPlate: null,
    plateFile: null, // Store the original uploaded file for reuse in quick-checkin
    loading: false,
    error: null
};

const ocrPlateSlice = createSlice({
    name: "ocrPlate",
    initialState,
    reducers: {
        ocrPlateRequest: (state, action) => {
            state.loading = true;
            state.error = null;
        },
        ocrPlateSuccess: (state, action) => {
            state.loading = false;
            state.ocrPlate = action.payload;
        },
        ocrPlateSetFile: (state, action) => {
            state.plateFile = action.payload;
        },
        ocrPlateFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        ocrPlateReset: (state) => {
            state.ocrPlate = null;
            state.plateFile = null;
            state.loading = false;
            state.error = null;
        }
    }
});

export const { ocrPlateRequest, ocrPlateSuccess, ocrPlateSetFile, ocrPlateFailure, ocrPlateReset } = ocrPlateSlice.actions;

export default ocrPlateSlice.reducer;