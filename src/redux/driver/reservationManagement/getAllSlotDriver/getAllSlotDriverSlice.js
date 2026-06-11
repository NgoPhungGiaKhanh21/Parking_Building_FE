import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    listSlot: null,
    loading: false,
    error: null
}

const getAllSlotDriverSlice = createSlice({
    name: "getAllSlotDriver",
    initialState,
    reducers: {
        getAllSlotDriverRequest: (state) => {
            state.loading = true;
        },
        getAllSlotDriverSuccess: (state, action) => {
            state.loading = false;
            state.listSlot = action.payload;
        },
        getAllSlotDriverFail: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        }
    }
})

export const { getAllSlotDriverRequest, getAllSlotDriverSuccess, getAllSlotDriverFail } = getAllSlotDriverSlice.actions;
export default getAllSlotDriverSlice.reducer;