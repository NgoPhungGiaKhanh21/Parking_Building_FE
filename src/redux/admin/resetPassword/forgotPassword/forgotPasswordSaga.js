import {call, put, takeLatest} from "redux-saga/effects";
import { forgotPasswordApi } from "../../../../service/admin/resetPassword";
import { forgotPasswordFailure, forgotPasswordRequest, forgotPasswordSuccess } from "./forgotPasswordSlice";
import { toast } from "react-toastify"
function* handleForgotPassword(action) {
    try {
        const response = yield call(forgotPasswordApi, action.payload);
        const data = response.data;
        yield put(forgotPasswordSuccess(data));
        toast.success("Password reset request successful")
    } catch (error) {
        const errorData = error.response?.data;
        const errorMessage = errorData?.message || error.message || "Fail to request password reset ";
        yield put(forgotPasswordFailure(errorMessage));
        toast.error(errorMessage);
    }
}

export function* watchForgotPassword() {
    yield takeLatest(forgotPasswordRequest.type, handleForgotPassword);
}