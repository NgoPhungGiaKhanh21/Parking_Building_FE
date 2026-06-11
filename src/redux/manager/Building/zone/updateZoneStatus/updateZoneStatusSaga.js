import { call, put, takeLatest } from "redux-saga/effects";
import { updateZoneStatusApi } from "../../../../../service/manager/buildingApi";
import {
  updateZoneStatusFail,
  updateZoneStatusRequest,
  updateZoneStatusSuccess,
} from "./updateZoneStatusSlice";
import { getZoneByFloorRequest } from "../getZoneByFloor/getZoneByFloorSlice";
import { toast } from "react-toastify";

function* handleUpdateZoneStatus(action) {
  try {
    const response = yield call(
      updateZoneStatusApi,
      action.payload.zoneId,
      action.payload.status,
    );

    const data = response.data;
    yield put(updateZoneStatusSuccess(data));
    yield put(getZoneByFloorRequest(action.payload.floorId));
    toast.success(`Zone is now ${action.payload.status}`);
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message || error.message || "Failed to update zone status";
    yield put(updateZoneStatusFail(errorData || errorMessage));
    toast.error(errorMessage);
  }
}

export function* watchUpdateZoneStatus() {
  yield takeLatest(updateZoneStatusRequest.type, handleUpdateZoneStatus);
}
