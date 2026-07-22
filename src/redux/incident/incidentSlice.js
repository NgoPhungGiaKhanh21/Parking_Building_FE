import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  myReports: [],
  allReports: [],
  loadingMyReports: false,
  loadingAllReports: false,
  creating: false,
  updating: false,
  checkingOut: false,
  loadingEvidence: false,
  loadingAvailableSlots: false,
  verifyingVehicle: false,
  validatingReassign: false,
  latestReservation: null,
  availableSlots: [],
  vehicleVerification: null,
  reassignValidation: null,
  enhancementError: null,
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

    getIncidentLatestReservationRequest: (state) => {
      state.loadingEvidence = true;
      state.latestReservation = null;
      state.enhancementError = null;
    },
    getIncidentLatestReservationSuccess: (state, action) => {
      state.loadingEvidence = false;
      state.latestReservation = action.payload;
    },
    getIncidentLatestReservationFail: (state, action) => {
      state.loadingEvidence = false;
      state.enhancementError = action.payload;
    },

    getIncidentAvailableSlotsRequest: (state) => {
      state.loadingAvailableSlots = true;
      state.availableSlots = [];
      state.reassignValidation = null;
      state.enhancementError = null;
    },
    getIncidentAvailableSlotsSuccess: (state, action) => {
      state.loadingAvailableSlots = false;
      state.availableSlots = action.payload;
    },
    getIncidentAvailableSlotsFail: (state, action) => {
      state.loadingAvailableSlots = false;
      state.enhancementError = action.payload;
    },

    verifyIncidentVehicleRequest: (state) => {
      state.verifyingVehicle = true;
      state.vehicleVerification = null;
      state.enhancementError = null;
    },
    verifyIncidentVehicleSuccess: (state, action) => {
      state.verifyingVehicle = false;
      state.vehicleVerification = action.payload;
    },
    verifyIncidentVehicleFail: (state, action) => {
      state.verifyingVehicle = false;
      state.enhancementError = action.payload;
    },

    validateIncidentReassignRequest: (state) => {
      state.validatingReassign = true;
      state.reassignValidation = null;
      state.enhancementError = null;
    },
    validateIncidentReassignSuccess: (state, action) => {
      state.validatingReassign = false;
      state.reassignValidation = action.payload;
    },
    validateIncidentReassignFail: (state, action) => {
      state.validatingReassign = false;
      state.enhancementError = action.payload;
    },

    resetIncidentEnhancement: (state) => {
      state.loadingEvidence = false;
      state.loadingAvailableSlots = false;
      state.verifyingVehicle = false;
      state.validatingReassign = false;
      state.latestReservation = null;
      state.availableSlots = [];
      state.vehicleVerification = null;
      state.reassignValidation = null;
      state.enhancementError = null;
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
  getIncidentLatestReservationRequest,
  getIncidentLatestReservationSuccess,
  getIncidentLatestReservationFail,
  getIncidentAvailableSlotsRequest,
  getIncidentAvailableSlotsSuccess,
  getIncidentAvailableSlotsFail,
  verifyIncidentVehicleRequest,
  verifyIncidentVehicleSuccess,
  verifyIncidentVehicleFail,
  validateIncidentReassignRequest,
  validateIncidentReassignSuccess,
  validateIncidentReassignFail,
  resetIncidentEnhancement,
  resetIncidentMutationStatus,
} = incidentSlice.actions;

export default incidentSlice.reducer;
