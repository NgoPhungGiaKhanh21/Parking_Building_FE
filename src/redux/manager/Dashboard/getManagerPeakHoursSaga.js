import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import { getManagerPeakHoursApi } from "../../../service/manager/dashboardApi";
import {
  getManagerPeakHoursRequest,
  getManagerPeakHoursSuccess,
  getManagerPeakHoursFail,
} from "./getManagerPeakHoursSlice";

function* handleGetManagerPeakHours(action) {
  try {
    const response = yield call(getManagerPeakHoursApi, action?.payload || {});
    const body = response?.data;
    const data = body?.data ?? body;
    yield put(getManagerPeakHoursSuccess(data));
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message ||
      error.message ||
      "Failed to fetch peak hour analysis";
    yield put(getManagerPeakHoursFail(errorData || errorMessage));
    toast.error(errorMessage);
  }
}

export function* watchGetManagerPeakHours() {
  yield takeLatest(
    getManagerPeakHoursRequest.type,
    handleGetManagerPeakHours,
  );
}
