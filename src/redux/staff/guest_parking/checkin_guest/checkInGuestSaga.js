import { call, put, takeLatest } from "redux-saga/effects";
import { checkInGuestRequest, checkInGuestSuccess, checkInGuestFail } from "./checkInGuestSlice";
import { quickCheckInApi } from "../../../../service/staff/parking_sessionApi";
import { toast } from "react-toastify";

function* handleCheckInGuest(action) {
    try {
        const response = yield call(quickCheckInApi, action.payload);
        const data = response.data;
        yield put(checkInGuestSuccess(data));
        toast.success("Guest Quick Check-in Success");
    } catch (error) {
        const errorData = error.response?.data;
        const errorMessage =
            errorData?.message || error.message || "Failed to check in guest";
        yield put(checkInGuestFail(errorData));
        toast.error(errorMessage);
    }
}

export function* watchCheckInGuest() {
    yield takeLatest(checkInGuestRequest.type, handleCheckInGuest);
}
