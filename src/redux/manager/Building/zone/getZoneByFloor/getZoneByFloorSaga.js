import { call, put, takeLatest } from "redux-saga/effects";
import { getZoneListApi } from "../../../../../service/manager/buildingApi";
import {
  getZoneByFloorRequest,
  getZoneByFloorSuccess,
  getZoneByFloorFail,
} from "./getZoneByFloorSlice";
import { toast } from "react-toastify";

function* handleGetZoneByFloor(action) {
  try {
    const response = yield call(getZoneListApi, action.payload);

    const data = response.data.data;
    yield put(getZoneByFloorSuccess(data));
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message || error.message || "Failed to fetch zone list";
    yield put(getZoneByFloorFail(errorData || errorMessage));
    toast.error(errorMessage);
  }
}

export function* watchGetZoneByFloor() {
  yield takeLatest(getZoneByFloorRequest.type, handleGetZoneByFloor);
}
