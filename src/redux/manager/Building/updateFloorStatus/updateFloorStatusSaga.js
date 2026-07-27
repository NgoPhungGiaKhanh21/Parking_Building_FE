import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import { updateFloorStatusApi } from "../../../../service/manager/buildingApi";
import { getBuildingFloorsRequest } from "../getBuildingFloors/getBuildingFloorsSlice";
import {
  updateFloorStatusFail,
  updateFloorStatusRequest,
  updateFloorStatusSuccess,
} from "./updateFloorStatusSlice";

function* handleUpdateFloorStatus(action) {
  try {
    const { floorId, buildingId, status } = action.payload;
    yield call(updateFloorStatusApi, floorId, status);
    yield put(updateFloorStatusSuccess());
    toast.success(`Floor is now ${status}`);
    if (buildingId) {
      yield put(getBuildingFloorsRequest(buildingId));
    }
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message || error.message || "Failed to update floor status";
    yield put(updateFloorStatusFail(errorData || errorMessage));
    toast.error(errorMessage);
  }
}

export function* watchUpdateFloorStatus() {
  yield takeLatest(updateFloorStatusRequest.type, handleUpdateFloorStatus);
}
