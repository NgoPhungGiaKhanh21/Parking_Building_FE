import {call, put, takeLatest} from "redux-saga/effects";
import { verifyOtpApi } from "../../../../service/admin/resetPassword";
import { verifyOtpFailure, verifyOtpRequest, verifyOtpSuccess } from "./verifyOtpSlice";
import { toast } from "react-toastify";
function* handleVerifyOtp(action) {
    try {
        const response = yield call(verifyOtpApi, action.payload);
        const data = response.data;
        yield put(verifyOtpSuccess(data));
        toast.success("OTP verification successful");
    } catch (error) {
        const errorData = error.response?.data;
        const errorMessage = errorData?.message || error.message || "Fail to verify OTP";
        yield put(verifyOtpFailure(errorMessage));
        toast.error(errorMessage);
    }
}

export function* watchVerifyOtp() {
    yield takeLatest(verifyOtpRequest.type, handleVerifyOtp);
}