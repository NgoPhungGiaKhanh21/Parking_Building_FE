import { call, put, takeLatest } from "redux-saga/effects";
import { changePasswordApi } from "../../service/changePassword/changePasswordApi";
import {
  changePasswordFail,
  changePasswordRequest,
  changePasswordSuccess,
} from "./changePasswordSlice";
import { toast } from "react-toastify";

function* handleChangePassword(action) {
  try {
    const response = yield call(changePasswordApi, action.payload);
    const data = response.data;
    yield put(changePasswordSuccess(data));
    toast.success("Password changed successfully");
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message || error.message || "Failed to change password";
    yield put(changePasswordFail(errorData || errorMessage));
    toast.error(errorMessage);
  }
}

export function* watchChangePassword() {
  yield takeLatest(changePasswordRequest.type, handleChangePassword);
}
