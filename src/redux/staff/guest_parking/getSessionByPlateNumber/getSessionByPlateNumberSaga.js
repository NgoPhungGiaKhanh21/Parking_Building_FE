import { call, put, takeLatest, select } from "redux-saga/effects";
import { normalizeReservation } from "../../../../utils/reservationSessionUtils";
import { getSessionByPlateNumberApi } from "../../../../service/staff/parking_sessionApi";
import {
  getSessionByPlateNumberRequest,
  getSessionByPlateNumberError,
  getSessionByPlateNumberSuccess,
} from "./getSessionByPlateNumberSlice";
import { toast } from "react-toastify";

function* handleGetSessionByPlateNumber(action) {
  const epoch = yield select((state) => state.getSessionByPlateNumber.epoch);
  try {
    const response = yield call(getSessionByPlateNumberApi, action.payload);
    const data = normalizeReservation(response.data.data);
    yield put(getSessionByPlateNumberSuccess({ data, epoch }));
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message ||
      error.message ||
      "Failed to fetch session by plate number";
    const silent = action.payload?.silent;
    const isNotFound = error.response?.status === 404;
    yield put(getSessionByPlateNumberError({
      epoch,
      error: errorData || errorMessage,
    }));
    if (!silent && !isNotFound) {
      toast.error(errorMessage);
    }
  }
}

export function* watchGetSessionByPlateNumber() {
  yield takeLatest(
    getSessionByPlateNumberRequest.type,
    handleGetSessionByPlateNumber,
  );
}
