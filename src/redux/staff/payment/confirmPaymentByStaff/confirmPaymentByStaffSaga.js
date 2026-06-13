import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import { confirmPaymentByStaffApi } from "../../../../service/staff/paymentApi";
import {
    confirmPaymentByStaffRequest,
    confirmPaymentByStaffSuccess,
    confirmPaymentByStaffFail,
} from "./confirmPaymentByStaffSlice";
import { getAllPaymentsRequest } from "../getAllPayments/getAllPaymentsSlice";

function* handleConfirmPaymentByStaff(action) {
    try {
        const response = yield call(confirmPaymentByStaffApi, action.payload);
        const data = response.data?.data ?? response.data;
        yield put(confirmPaymentByStaffSuccess(data));
        yield put(getAllPaymentsRequest());
        toast.success("Payment confirmed successfully");
    } catch (error) {
        const errorData = error.response?.data;
        const errorMessage =
            errorData?.message || error.message || "Failed to confirm payment";
        yield put(confirmPaymentByStaffFail(errorMessage));
        toast.error(errorMessage);
    }
}

export function* watchConfirmPaymentByStaff() {
    yield takeLatest(confirmPaymentByStaffRequest.type, handleConfirmPaymentByStaff);
}
