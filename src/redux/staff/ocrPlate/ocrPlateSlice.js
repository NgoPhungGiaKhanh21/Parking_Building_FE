import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    ocrPlate: null,
    plateFile: null, // Store the original uploaded file for reuse in quick-checkin
    loading: false,
    error: null,
    epoch: 0,
};

const ocrPlateSlice = createSlice({
    name: "ocrPlate",
    initialState,
    reducers: {
        ocrPlateRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.epoch += 1;
        },
        ocrPlateSuccess: (state, action) => {
            const { epoch, data } = action.payload;
            state.loading = false;
            if (epoch !== state.epoch) return;
            state.ocrPlate = data;
        },
        ocrPlateSetFile: (state, action) => {
            state.plateFile = action.payload;
        },
        ocrPlateFailure: (state, action) => {
            const { epoch, error } = action.payload;
            state.loading = false;
            if (epoch !== state.epoch) return;
            state.error = error;
        },
        ocrPlateReset: (state) => {
            state.ocrPlate = null;
            state.plateFile = null;
            state.loading = false;
            state.error = null;
            state.epoch += 1;
        }
    }
});

export const { ocrPlateRequest, ocrPlateSuccess, ocrPlateSetFile, ocrPlateFailure, ocrPlateReset } = ocrPlateSlice.actions;

export default ocrPlateSlice.reducer;