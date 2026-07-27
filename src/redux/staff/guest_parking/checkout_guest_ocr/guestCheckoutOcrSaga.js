import { call, put, takeLatest } from "redux-saga/effects";
import {
    guestCheckoutOcrRequest,
    guestCheckoutOcrSuccess,
    guestCheckoutOcrFail,
} from "./guestCheckoutOcrSlice";
import { guestCheckoutOcrApi } from "../../../../service/staff/parking_sessionApi";
import { toast } from "react-toastify";

function* handleGuestCheckoutOcr(action) {
    try {
        const response = yield call(guestCheckoutOcrApi, action.payload);
        const data = response.data;
        yield put(guestCheckoutOcrSuccess(data));
        toast.success(data?.message || "Guest checkout successful");
    } catch (error) {
        const errorData = error.response?.data;
        const errorMessage =
            errorData?.message || error.message || "Failed to checkout guest";
        yield put(guestCheckoutOcrFail(errorMessage));
        toast.error(errorMessage);
    }
}

export function* watchGuestCheckoutOcr() {
    yield takeLatest(guestCheckoutOcrRequest.type, handleGuestCheckoutOcr);
}
