import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import { getManagerDashboardStatsApi } from "../../../service/manager/dashboardApi";
import {
  getManagerDashboardStatsRequest,
  getManagerDashboardStatsSuccess,
  getManagerDashboardStatsFail,
} from "./getManagerDashboardStatsSlice";

function* handleGetManagerDashboardStats(action) {
  try {
    const response = yield call(
      getManagerDashboardStatsApi,
      action?.payload || {},
    );
    const body = response?.data;
    const data = body?.data ?? body;
    yield put(getManagerDashboardStatsSuccess(data));
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message ||
      error.message ||
      "Failed to fetch manager dashboard stats";
    yield put(getManagerDashboardStatsFail(errorData || errorMessage));
    toast.error(errorMessage);
  }
}

export function* watchGetManagerDashboardStats() {
  yield takeLatest(
    getManagerDashboardStatsRequest.type,
    handleGetManagerDashboardStats,
  );
}
