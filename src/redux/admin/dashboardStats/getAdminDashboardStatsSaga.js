import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import { getAdminDashboardStatsApi } from "../../../service/admin/dashboardStatsApi";
import {
  getAdminDashboardStatsRequest,
  getAdminDashboardStatsSuccess,
  getAdminDashboardStatsFail,
} from "./getAdminDashboardStatsSlice";

function* handleGetAdminDashboardStats(action) {
  try {
    const response = yield call(getAdminDashboardStatsApi, action?.payload || {});
    const body = response?.data;
    const data = body?.data ?? body;
    yield put(getAdminDashboardStatsSuccess(data));
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message || error.message || "Failed to fetch admin dashboard stats";
    yield put(getAdminDashboardStatsFail(errorData || errorMessage));
    toast.error(errorMessage);
  }
}

export function* watchGetAdminDashboardStats() {
  yield takeLatest(
    getAdminDashboardStatsRequest.type,
    handleGetAdminDashboardStats,
  );
}

