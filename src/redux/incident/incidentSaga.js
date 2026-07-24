import { call, put, select, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import {
  checkoutDriverAfterIncidentApi,
  createDriverIncidentApi,
  getAllDriverIncidentsApi,
  getIncidentAvailableSlotsApi,
  getIncidentLatestReservationApi,
  getIncidentSessionEvidenceApi,
  getIncidentsBySessionApi,
  getMyDriverIncidentsApi,
  updateIncidentStatusApi,
  validateIncidentReassignApi,
  verifyIncidentVehicleApi,
} from "../../service/incidentApi";
import {
  checkoutDriverAfterIncidentFail,
  checkoutDriverAfterIncidentRequest,
  checkoutDriverAfterIncidentSuccess,
  createDriverIncidentFail,
  createDriverIncidentRequest,
  createDriverIncidentSuccess,
  getAllDriverIncidentsFail,
  getAllDriverIncidentsRequest,
  getAllDriverIncidentsSuccess,
  getIncidentAvailableSlotsFail,
  getIncidentAvailableSlotsRequest,
  getIncidentAvailableSlotsSuccess,
  getIncidentLatestReservationFail,
  getIncidentLatestReservationRequest,
  getIncidentLatestReservationSuccess,
  getIncidentSessionEvidenceFail,
  getIncidentSessionEvidenceRequest,
  getIncidentSessionEvidenceSuccess,
  getIncidentsBySessionFail,
  getIncidentsBySessionRequest,
  getIncidentsBySessionSuccess,
  getMyDriverIncidentsFail,
  getMyDriverIncidentsRequest,
  getMyDriverIncidentsSuccess,
  updateIncidentStatusFail,
  updateIncidentStatusRequest,
  updateIncidentStatusSuccess,
  validateIncidentReassignFail,
  validateIncidentReassignRequest,
  validateIncidentReassignSuccess,
  verifyIncidentVehicleFail,
  verifyIncidentVehicleRequest,
  verifyIncidentVehicleSuccess,
} from "./incidentSlice";

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || error.message || fallback;

const getResponseData = (response) =>
  response?.data?.data ?? response?.data ?? null;

const getResponseList = (response) => {
  const data = getResponseData(response);
  if (Array.isArray(data)) return data;
  return data?.content ?? data?.items ?? [];
};

function* handleGetMyDriverIncidents() {
  try {
    const response = yield call(getMyDriverIncidentsApi);
    yield put(getMyDriverIncidentsSuccess(getResponseList(response)));
  } catch (error) {
    const message = getErrorMessage(error, "Failed to load your reports");
    yield put(getMyDriverIncidentsFail(message));
    toast.error(message);
  }
}

function* handleGetAllDriverIncidents(action) {
  try {
    const response = yield call(getAllDriverIncidentsApi, action.payload);
    yield put(getAllDriverIncidentsSuccess(getResponseList(response)));
  } catch (error) {
    const message = getErrorMessage(error, "Failed to load driver reports");
    yield put(getAllDriverIncidentsFail(message));
    toast.error(message);
  }
}

function* handleCreateDriverIncident(action) {
  try {
    yield call(createDriverIncidentApi, action.payload);
    yield put(createDriverIncidentSuccess());
    yield put(getMyDriverIncidentsRequest());
    toast.success("Report submitted successfully");
  } catch (error) {
    const message = getErrorMessage(error, "Failed to submit report");
    yield put(createDriverIncidentFail(message));
    toast.error(message);
  }
}

function* handleUpdateIncidentStatus(action) {
  try {
    yield call(updateIncidentStatusApi, action.payload);
    yield put(updateIncidentStatusSuccess());
    const buildingId = yield select(
      (state) => state.incident.activeBuildingId,
    );
    yield put(getAllDriverIncidentsRequest(buildingId));
    toast.success("Incident updated successfully");
  } catch (error) {
    const message = getErrorMessage(error, "Failed to update incident");
    yield put(updateIncidentStatusFail(message));
    toast.error(message);
  }
}

function* handleCheckoutDriverAfterIncident(action) {
  try {
    yield call(checkoutDriverAfterIncidentApi, action.payload);
    yield put(checkoutDriverAfterIncidentSuccess());
    const buildingId = yield select(
      (state) => state.incident.activeBuildingId,
    );
    yield put(getAllDriverIncidentsRequest(buildingId));
    toast.success("Driver checked out successfully");
  } catch (error) {
    const message = getErrorMessage(error, "Failed to check out driver");
    yield put(checkoutDriverAfterIncidentFail(message));
    toast.error(message);
  }
}

function* handleGetIncidentLatestReservation(action) {
  try {
    const response = yield call(getIncidentLatestReservationApi, action.payload);
    yield put(getIncidentLatestReservationSuccess(getResponseData(response)));
  } catch (error) {
    const message = getErrorMessage(
      error,
      "Failed to load latest reservation evidence",
    );
    yield put(getIncidentLatestReservationFail(message));
  }
}

function* handleGetIncidentSessionEvidence(action) {
  try {
    const response = yield call(getIncidentSessionEvidenceApi, action.payload);
    yield put(getIncidentSessionEvidenceSuccess(getResponseData(response)));
  } catch (error) {
    const message = getErrorMessage(
      error,
      "Failed to load parking session evidence",
    );
    yield put(getIncidentSessionEvidenceFail(message));
  }
}

function* handleGetIncidentAvailableSlots(action) {
  try {
    const response = yield call(getIncidentAvailableSlotsApi, action.payload);
    yield put(getIncidentAvailableSlotsSuccess(getResponseList(response)));
  } catch (error) {
    const message = getErrorMessage(
      error,
      "Failed to load available replacement slots",
    );
    yield put(getIncidentAvailableSlotsFail(message));
  }
}

function* handleGetIncidentsBySession(action) {
  try {
    const response = yield call(getIncidentsBySessionApi, action.payload);
    yield put(getIncidentsBySessionSuccess(getResponseList(response)));
  } catch (error) {
    const message = getErrorMessage(
      error,
      "Failed to load related incidents",
    );
    yield put(getIncidentsBySessionFail(message));
  }
}

function* handleVerifyIncidentVehicle(action) {
  try {
    const response = yield call(verifyIncidentVehicleApi, action.payload);
    const result = getResponseData(response);
    yield put(verifyIncidentVehicleSuccess(result));
    toast.success(result?.message || "Vehicle verification completed");
  } catch (error) {
    const message = getErrorMessage(error, "Vehicle verification failed");
    yield put(verifyIncidentVehicleFail(message));
    toast.error(message);
  }
}

function* handleValidateIncidentReassign(action) {
  try {
    const response = yield call(validateIncidentReassignApi, action.payload);
    yield put(validateIncidentReassignSuccess(getResponseData(response)));
  } catch (error) {
    const message = getErrorMessage(
      error,
      "Failed to validate replacement slot",
    );
    yield put(validateIncidentReassignFail(message));
    toast.error(message);
  }
}

export function* watchIncident() {
  yield takeLatest(
    getMyDriverIncidentsRequest.type,
    handleGetMyDriverIncidents,
  );
  yield takeLatest(
    getAllDriverIncidentsRequest.type,
    handleGetAllDriverIncidents,
  );
  yield takeLatest(
    createDriverIncidentRequest.type,
    handleCreateDriverIncident,
  );
  yield takeLatest(
    updateIncidentStatusRequest.type,
    handleUpdateIncidentStatus,
  );
  yield takeLatest(
    checkoutDriverAfterIncidentRequest.type,
    handleCheckoutDriverAfterIncident,
  );
  yield takeLatest(
    getIncidentLatestReservationRequest.type,
    handleGetIncidentLatestReservation,
  );
  yield takeLatest(
    getIncidentSessionEvidenceRequest.type,
    handleGetIncidentSessionEvidence,
  );
  yield takeLatest(
    getIncidentAvailableSlotsRequest.type,
    handleGetIncidentAvailableSlots,
  );
  yield takeLatest(
    getIncidentsBySessionRequest.type,
    handleGetIncidentsBySession,
  );
  yield takeLatest(
    verifyIncidentVehicleRequest.type,
    handleVerifyIncidentVehicle,
  );
  yield takeLatest(
    validateIncidentReassignRequest.type,
    handleValidateIncidentReassign,
  );
}
