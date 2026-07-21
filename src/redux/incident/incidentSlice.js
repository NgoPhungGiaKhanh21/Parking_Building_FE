import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  myReports: [],
  allReports: [],
  loadingMyReports: false,
  loadingAllReports: false,
  creating: false,
  updating: false,
  checkingOut: false,
  createSuccess: false,
  updateSuccess: false,
  checkoutSuccess: false,
  error: null,
};

const incidentSlice = createSlice({
  name: "incident",
  initialState,
  reducers: {
    getMyDriverIncidentsRequest: (state) => {
      state.loadingMyReports = true;
      state.error = null;
    },
    getMyDriverIncidentsSuccess: (state, action) => {
      state.loadingMyReports = false;
      state.myReports = action.payload;
    },
    getMyDriverIncidentsFail: (state, action) => {
      state.loadingMyReports = false;
      state.error = action.payload;
    },

    getAllDriverIncidentsRequest: (state) => {
      state.loadingAllReports = true;
      state.error = null;
    },
    getAllDriverIncidentsSuccess: (state, action) => {
      state.loadingAllReports = false;
      state.allReports = action.payload;
    },
    getAllDriverIncidentsFail: (state, action) => {
      state.loadingAllReports = false;
      state.error = action.payload;
    },

    createDriverIncidentRequest: (state) => {
      state.creating = true;
      state.createSuccess = false;
      state.error = null;
    },
    createDriverIncidentSuccess: (state) => {
      state.creating = false;
      state.createSuccess = true;
    },
    createDriverIncidentFail: (state, action) => {
      state.creating = false;
      state.error = action.payload;
    },

    updateIncidentStatusRequest: (state) => {
      state.updating = true;
      state.updateSuccess = false;
      state.error = null;
    },
    updateIncidentStatusSuccess: (state) => {
      state.updating = false;
      state.updateSuccess = true;
    },
    updateIncidentStatusFail: (state, action) => {
      state.updating = false;
      state.error = action.payload;
    },

    checkoutDriverAfterIncidentRequest: (state) => {
      state.checkingOut = true;
      state.checkoutSuccess = false;
      state.error = null;
    },
    checkoutDriverAfterIncidentSuccess: (state) => {
      state.checkingOut = false;
      state.checkoutSuccess = true;
    },
    checkoutDriverAfterIncidentFail: (state, action) => {
      state.checkingOut = false;
      state.error = action.payload;
    },

    resetIncidentMutationStatus: (state) => {
      state.createSuccess = false;
      state.updateSuccess = false;
      state.checkoutSuccess = false;
      state.error = null;
    },
  },
});

export const {
  getMyDriverIncidentsRequest,
  getMyDriverIncidentsSuccess,
  getMyDriverIncidentsFail,
  getAllDriverIncidentsRequest,
  getAllDriverIncidentsSuccess,
  getAllDriverIncidentsFail,
  createDriverIncidentRequest,
  createDriverIncidentSuccess,
  createDriverIncidentFail,
  updateIncidentStatusRequest,
  updateIncidentStatusSuccess,
  updateIncidentStatusFail,
  checkoutDriverAfterIncidentRequest,
  checkoutDriverAfterIncidentSuccess,
  checkoutDriverAfterIncidentFail,
  resetIncidentMutationStatus,
} = incidentSlice.actions;

export default incidentSlice.reducer;
