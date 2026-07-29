import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import { getDriverPaymentsApi } from "../../../../service/Driver/paymentApi";
import {
    getDriverPaymentsRequest,
    getDriverPaymentsSuccess,
    getDriverPaymentsFail,
} from "./getDriverPaymentsSlice";

function* handleGetDriverPayments(action) {
    try {
        const { driverId, limit = 20 } = action.payload;
        const response = yield call(getDriverPaymentsApi, driverId, limit);
        const data = response.data?.data ?? response.data;
        const list = Array.isArray(data) ? data : data?.content ?? data?.items ?? [];
        yield put(getDriverPaymentsSuccess(list));
    } catch (error) {
        const errorData = error.response?.data;
        const errorMessage =
            errorData?.message || error.message || "Failed to get payment history";
        yield put(getDriverPaymentsFail(errorMessage));
        toast.error(errorMessage);
    }
}

export function* watchGetDriverPayments() {
    yield takeLatest(getDriverPaymentsRequest.type, handleGetDriverPayments);
}
