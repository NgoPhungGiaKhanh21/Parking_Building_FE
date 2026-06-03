import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import { updateBuildingStatusApi } from "../../../service/manager/buildingApi";
import { getBuildingListRequest } from "./getBuildingListSlice";
import {
  updateBuildingStatusFail,
  updateBuildingStatusRequest,
  updateBuildingStatusSuccess,
} from "./updateBuildingStatusSlice";

function* handleUpdateBuildingStatus(action) {
  try {
    const { buildingId, status } = action.payload;
    yield call(updateBuildingStatusApi, buildingId, status);
    yield put(updateBuildingStatusSuccess());
    toast.success(`Building is now ${status}`);
    yield put(getBuildingListRequest());
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message || error.message || "Failed to update building status";
    yield put(updateBuildingStatusFail(errorData || errorMessage));
    toast.error(errorMessage);
  }
}

export function* watchUpdateBuildingStatus() {
  yield takeLatest(updateBuildingStatusRequest.type, handleUpdateBuildingStatus);
}
