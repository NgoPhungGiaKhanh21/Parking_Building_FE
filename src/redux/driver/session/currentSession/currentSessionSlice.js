import {createSlice} from "@reduxjs/toolkit"

const initialState = {
    currentSession: null,
    loading: false,
    error: null,
}

const currentSessionSlice = createSlice({
    name: "currentSession",
    initialState,
    reducers: {
        getCurrentSessionRequest: (state) => {
            state.loading = true;
        },
        getCurrentSessionSuccess: (state, action) => {
            state.loading = false;
            state.currentSession = action.payload;
        },
        getCurrentSessionFail: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        }
    }
})


export const {getCurrentSessionRequest, getCurrentSessionSuccess, getCurrentSessionFail} = currentSessionSlice.actions;

export default currentSessionSlice.reducer;

