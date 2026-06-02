import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import { getBuildingFloorsApi } from "../../../service/manager/buildingApi";
import {
  getBuildingFloorsFail,
  getBuildingFloorsRequest,
  getBuildingFloorsSuccess,
} from "./getBuildingFloorsSlice";

function* handleGetBuildingFloors(action) {
  try {
    const response = yield call(getBuildingFloorsApi, action.payload);
    const floors = response?.data?.data ?? [];
    yield put(getBuildingFloorsSuccess(floors));
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message || error.message || "Failed to fetch building floors";
    yield put(getBuildingFloorsFail(errorData || errorMessage));
    toast.error(errorMessage);
  }
}

export function* watchGetBuildingFloors() {
  yield takeLatest(getBuildingFloorsRequest.type, handleGetBuildingFloors);
}
