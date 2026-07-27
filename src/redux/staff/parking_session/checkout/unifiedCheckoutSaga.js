import { call, put, takeLatest } from "redux-saga/effects";
import { unifiedCheckoutApi } from "../../../../service/staff/parking_sessionApi";
import {
  unifiedCheckoutRequest,
  unifiedCheckoutSuccess,
  unifiedCheckoutFail,
} from "./unifiedCheckoutSlice";
import { toast } from "react-toastify";

function* handleUnifiedCheckout(action) {
  try {
    const response = yield call(unifiedCheckoutApi, action.payload);
    const data = response.data?.data || response.data;
    yield put(unifiedCheckoutSuccess(data));
    toast.success(data?.message || "Check-out successful");
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message || error.message || "Failed to check out";
    yield put(unifiedCheckoutFail(errorData || errorMessage));
    toast.error(errorMessage);
  }
}

export function* watchUnifiedCheckout() {
  yield takeLatest(unifiedCheckoutRequest.type, handleUnifiedCheckout);
}
