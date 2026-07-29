import { call, put, takeLatest } from "redux-saga/effects"
import { getMyReservationsApi } from "../../../../service/Driver/revervationApi"
import {
    getMyReservationsFail,
    getMyReservationsRequest,
    getMyReservationsSuccess
} from "./getMyReservationsSlice"

function* handleGetMyReservations() {
    try {
        const response = yield call(getMyReservationsApi)
        const data = response.data.data;
        yield put(getMyReservationsSuccess(data));
    } catch (error) {
        const errorData = error.response?.data;
        const errorMessage = errorData?.message || error.message || "Fail to get reservations";
        yield put(getMyReservationsFail(errorMessage));
    }
}

export function* watchGetMyReservations() {
    yield takeLatest(getMyReservationsRequest.type, handleGetMyReservations)
}
