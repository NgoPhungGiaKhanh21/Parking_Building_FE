import { call, put, takeLatest, select } from "redux-saga/effects";
import { plateLookupForCheckinApi } from "../../../../service/staff/parking_sessionApi";
import { normalizePlateLookupResponse } from "../../../../utils/plateLookupUtils";
import {
  plateLookupRequest,
  plateLookupSuccess,
  plateLookupError,
} from "./plateLookupSlice";

function* handlePlateLookup(action) {
  const epoch = yield select((state) => state.plateLookup.epoch);
  try {
    const response = yield call(plateLookupForCheckinApi, action.payload);
    const raw = response?.data?.data ?? response?.data;
    const data = normalizePlateLookupResponse(raw);
    yield put(plateLookupSuccess({ data, epoch }));
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message || error.message || "Failed to lookup plate";
    yield put(
      plateLookupError({
        epoch,
        error: errorData || errorMessage,
      }),
    );
  }
}

export function* watchPlateLookup() {
  yield takeLatest(plateLookupRequest.type, handlePlateLookup);
}
