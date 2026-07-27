import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import { getAllPaymentsApi } from "../../../../service/staff/paymentApi";
import {
    getAllPaymentsRequest,
    getAllPaymentsSuccess,
    getAllPaymentsFail,
} from "./getAllPaymentsSlice";

function* handleGetAllPayments() {
    try {
        const response = yield call(getAllPaymentsApi);
        const data = response.data?.data ?? response.data;
        const list = Array.isArray(data) ? data : data?.content ?? data?.items ?? [];
        yield put(getAllPaymentsSuccess(list));
    } catch (error) {
        const errorData = error.response?.data;
        const errorMessage =
            errorData?.message || error.message || "Failed to fetch payments";
        yield put(getAllPaymentsFail(errorMessage));
        toast.error(errorMessage);
    }
}

export function* watchGetAllPayments() {
    yield takeLatest(getAllPaymentsRequest.type, handleGetAllPayments);
}
