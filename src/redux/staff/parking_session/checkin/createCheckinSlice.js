import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    createCheckin: null,
    loading: false,
    error: null,
}

const createCheckinSlice = createSlice({
    name: "createCheckin",
    initialState,
    reducers: {
        createCheckinRequest: (state) => {
            state.loading = true;
        },
        createCheckinSuccess: (state, action) => {
            state.loading = false;
            state.createCheckin = action.payload;
        },
        createCheckinFail: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
    },
});

export const {
    createCheckinRequest,
    createCheckinSuccess,
    createCheckinFail,
} = createCheckinSlice.actions;

export default createCheckinSlice.reducer;