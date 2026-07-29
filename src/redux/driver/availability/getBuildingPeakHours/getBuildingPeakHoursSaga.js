import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import { getBuildingPeakHoursApi } from "../../../../service/Driver/revervationApi";
import {
  getBuildingPeakHoursRequest,
  getBuildingPeakHoursSuccess,
  getBuildingPeakHoursFail,
} from "./getBuildingPeakHoursSlice";

function* handleGetBuildingPeakHours(action) {
  try {
    const { buildingId, fromDay, toDay } = action.payload || {};
    const response = yield call(getBuildingPeakHoursApi, {
      buildingId,
      fromDay,
      toDay,
    });
    const body = response?.data;
    const data = body?.data ?? body;
    yield put(getBuildingPeakHoursSuccess(data));
  } catch (error) {
    const errorData = error.response?.data;
    const message =
      errorData?.message ||
      error.message ||
      "Failed to fetch peak hour analysis";
    yield put(getBuildingPeakHoursFail(errorData || message));
    toast.error(message);
  }
}

export function* watchGetBuildingPeakHours() {
  yield takeLatest(
    getBuildingPeakHoursRequest.type,
    handleGetBuildingPeakHours,
  );
}
