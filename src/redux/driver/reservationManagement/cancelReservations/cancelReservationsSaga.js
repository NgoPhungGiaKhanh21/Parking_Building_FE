import { call, put, takeLatest } from "redux-saga/effects"
import { cancelReservationApi } from "../../../../service/driver/revervationApi"
import { cancelReservationsFail, cancelReservationsSuccess, cancelReservations } from "./cancelReservationsSlice"
import { getMyReservationsRequest } from "../getMyReservations/getMyReservationsSlice"
import {toast} from "react-toastify";
function* handleCancelReservations(action) {
    try {
        const response = yield call(cancelReservationApi, action.payload.reservationCode, action.payload.reason);
        yield put(cancelReservationsSuccess(response.data));
        yield put(getMyReservationsRequest());
        toast.success("Reservation cancelled successfully");
    } catch (error) {
        const errorData = error.response?.data;
        const errorMessage = errorData?.message || error.message || "Fail to cancel reservation";
        yield put(cancelReservationsFail(errorMessage));
        toast.error(errorMessage);
    }
}

export function* watchCancelReservations() {
    yield takeLatest(cancelReservations.type, handleCancelReservations);
}
