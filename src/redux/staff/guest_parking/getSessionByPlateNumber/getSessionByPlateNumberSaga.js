import { call, put, takeLatest } from "redux-saga/effects";
import { getSessionByPlateNumberApi } from "../../../../service/staff/parking_sessionApi";
import {
  getSessionByPlateNumberRequest,
  getSessionByPlateNumberError,
  getSessionByPlateNumberSuccess,
} from "./getSessionByPlateNumberSlice";
import { toast } from "react-toastify";

function* handleGetSessionByPlateNumber(action) {
  try {
    const response = yield call(getSessionByPlateNumberApi, action.payload);
    const data = response.data.data;
    yield put(getSessionByPlateNumberSuccess(data));
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message ||
      error.message ||
      "Failed to fetch session by plate number";
    yield put(getSessionByPlateNumberError(errorData || errorMessage));
    toast.error(errorMessage);
  }
}

export function* watchGetSessionByPlateNumber() {
  yield takeLatest(
    getSessionByPlateNumberRequest.type,
    handleGetSessionByPlateNumber,
  );
}
