import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import { initiatePaymentApi } from "../../../../service/driver/paymentApi";
import {
    initiatePaymentRequest,
    initiatePaymentSuccess,
    initiatePaymentFail,
} from "./initiatePaymentSlice";
import { getCurrentSessionRequest } from "../../session/currentSession/currentSessionSlice";

function* handleInitiatePayment(action) {
    try {
        const response = yield call(initiatePaymentApi, action.payload);
        const data = response.data?.data ?? response.data;
        yield put(initiatePaymentSuccess(data));
        yield put(getCurrentSessionRequest());

        const paymentUrl =
            data?.checkoutUrl ||
            data?.paymentUrl ||
            data?.vnpUrl ||
            data?.url ||
            data?.redirectUrl;

        if (paymentUrl) {
            toast.success("Redirecting to payment gateway...");
            window.location.href = paymentUrl;
        } else {
            toast.success("Payment initiated successfully");
        }
    } catch (error) {
        const errorData = error.response?.data;
        const errorMessage =
            errorData?.message || error.message || "Failed to initiate payment";
        yield put(initiatePaymentFail(errorMessage));
        toast.error(errorMessage);
    }
}

export function* watchInitiatePayment() {
    yield takeLatest(initiatePaymentRequest.type, handleInitiatePayment);
}
