import { call, put, takeLatest } from "redux-saga/effects";
import { getBuildingStaffApi } from "../../../../service/manager/staffManagementAPI";
import {
  getBuildingStaffFail,
  getBuildingStaffRequest,
  getBuildingStaffSuccess,
} from "./getBuildingStaffSlice";
import { toast } from "react-toastify";

function* getBuildingStaffSaga(action) {
  try {
    const response = yield call(getBuildingStaffApi, action.payload);
    const staffList = response?.data?.data ?? [];
    yield put(getBuildingStaffSuccess(staffList));
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message ||
      error.message ||
      "Failed to fetch building staff";
    yield put(getBuildingStaffFail(errorMessage));
    toast.error(errorMessage);
  }
}

export function* watchGetBuildingStaff() {
  yield takeLatest(getBuildingStaffRequest.type, getBuildingStaffSaga);
}
