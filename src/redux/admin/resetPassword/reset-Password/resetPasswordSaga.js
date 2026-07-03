import {call, put, takeLatest} from "redux-saga/effects";
import { resetPasswordApi } from "../../../../service/admin/resetPassword";
import { resetPasswordFailure, resetPasswordRequest, resetPasswordSuccess } from "./resetPasswordSlice";
import { toast } from "react-toastify";


function* handleResetPassword(action) {
    try {
        const response = yield call(resetPasswordApi, action.payload);
        const data = response.data;
        yield put(resetPasswordSuccess(data));
        toast.success("Password reset successful");
    } catch (error) {
        const errorData = error.response?.data;
        const errorMessage = errorData?.message || error.message || "Fail to reset password";
        yield put(resetPasswordFailure(errorMessage));
        toast.error(errorMessage);
    }
}

export function* watchResetPassword() {
    yield takeLatest(resetPasswordRequest.type, handleResetPassword);
}