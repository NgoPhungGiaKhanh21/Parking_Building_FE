import { call, put, takeLatest } from "redux-saga/effects";
import { getStaffBuildingsApi } from "../../../../service/manager/staffManagementAPI";
import {
  getStaffBuildingsFail,
  getStaffBuildingsRequest,
  getStaffBuildingsSuccess,
} from "./getStaffBuildingsSlice";
import { toast } from "react-toastify";

function* getStaffBuildingsSaga(action) {
  try {
    const response = yield call(getStaffBuildingsApi, action.payload);
    const buildings = response?.data?.data ?? [];
    yield put(getStaffBuildingsSuccess(buildings));
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message ||
      error.message ||
      "Failed to fetch staff buildings";
    yield put(getStaffBuildingsFail(errorMessage));
    toast.error(errorMessage);
  }
}

export function* watchGetStaffBuildings() {
  yield takeLatest(getStaffBuildingsRequest.type, getStaffBuildingsSaga);
}
