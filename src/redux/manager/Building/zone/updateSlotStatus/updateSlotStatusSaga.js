import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import { updateSlotStatusApi } from "../../../../../service/manager/buildingApi";
import { getSlotByZoneRequest } from "../getSlotByZone/getSlotByZoneSlice";
import { getZoneByFloorRequest } from "../getZoneByFloor/getZoneByFloorSlice";
import {
  updateSlotStatusFail,
  updateSlotStatusRequest,
  updateSlotStatusSuccess,
} from "./updateSlotStatusSlice";

function* handleUpdateSlotStatus(action) {
  try {
    const { slotId, zoneId, status, floorId } = action.payload;
    yield call(updateSlotStatusApi, slotId, status);
    yield put(updateSlotStatusSuccess());
    toast.success(`Slot is now ${status}`);
    if (zoneId) {
      yield put(getSlotByZoneRequest(zoneId));
    }
    if (floorId) {
      yield put(getZoneByFloorRequest(floorId));
    }
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message || error.message || "Failed to update slot status";
    yield put(updateSlotStatusFail(errorData || errorMessage));
    toast.error(errorMessage);
  }
}

export function* watchUpdateSlotStatus() {
  yield takeLatest(updateSlotStatusRequest.type, handleUpdateSlotStatus);
}
