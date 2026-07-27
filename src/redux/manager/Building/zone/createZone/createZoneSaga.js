import { call, put, takeLatest } from "redux-saga/effects";
import { createZoneApi } from "../../../../../service/manager/buildingApi";
import {
  createZoneSuccess,
  createZoneFail,
  createZoneRequest,
} from "./createZoneSlice";
import { getZoneByFloorRequest } from "../getZoneByFloor/getZoneByFloorSlice";
import { toast } from "react-toastify";

function* handleCreateZone(action) {
  try {
    const { floorId, data } = action.payload;
    yield call(createZoneApi, floorId, data);
    yield put(createZoneSuccess());
    yield put(getZoneByFloorRequest(floorId));
    toast.success("Zone created successfully");
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message || error.message || "Failed to create zone";
    yield put(createZoneFail(errorData || errorMessage));
    toast.error(errorMessage);
  }
}

export function* watchCreateZone() {
  yield takeLatest(createZoneRequest.type, handleCreateZone);
}
