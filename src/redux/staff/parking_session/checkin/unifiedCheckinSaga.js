import { call, put, takeLatest } from "redux-saga/effects";
import { checkInApi } from "../../../../service/staff/parking_sessionApi";
import {
  unifiedCheckinRequest,
  unifiedCheckinSuccess,
  unifiedCheckinFail,
} from "./unifiedCheckinSlice";
import { toast } from "react-toastify";

function* handleUnifiedCheckin(action) {
  try {
    const response = yield call(checkInApi, action.payload);
    const data = response.data.data;
    yield put(unifiedCheckinSuccess(data));
    toast.success("Check-in successful");
  } catch (error) {
    const errorData = error.response?.data;
    let errorMessage = "Failed to check in";
    
    if (errorData) {
      errorMessage = errorData.message || errorData.error || errorData.details || (typeof errorData === 'string' ? errorData : error.message);
    } else {
      errorMessage = error.message;
    }

    yield put(unifiedCheckinFail(errorMessage));
    toast.error(errorMessage);
  }
}

export function* watchUnifiedCheckin() {
  yield takeLatest(unifiedCheckinRequest.type, handleUnifiedCheckin);
}
