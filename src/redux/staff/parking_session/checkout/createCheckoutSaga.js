import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import { checkOutApi } from "../../../../service/staff/parking_sessionApi";
import {
    createCheckoutRequest,
    createCheckoutSuccess,
    createCheckoutFail,
} from "./createCheckoutSlice";

function* handleCreateCheckout(action) {
    try {
        const response = yield call(checkOutApi, action.payload);
        const data = response.data?.data ?? response.data;
        yield put(createCheckoutSuccess(data));
        toast.success("Check-out successful");
    } catch (error) {
        const errorData = error.response?.data;
        const errorMessage =
            errorData?.message || error.message || "Failed to check out";
        yield put(createCheckoutFail(errorMessage));
        toast.error(errorMessage);
    }
}

export function* watchCreateCheckout() {
    yield takeLatest(createCheckoutRequest.type, handleCreateCheckout);
}
