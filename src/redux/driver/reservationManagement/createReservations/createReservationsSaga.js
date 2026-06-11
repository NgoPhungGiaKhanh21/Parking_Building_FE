import { call, put, takeLatest } from "redux-saga/effects"
import { createReservationApi } from "../../../../service/driver/revervationApi"
import {
    createReservationsFail,
    createReservationsRequest,
    createReservationsSuccess
} from "./createReservationsSlice"
import { toast } from "react-toastify"

function* handleCreateReservation(action) {
    try {
        const response = yield call(createReservationApi, action.payload)
        const data = response.data.data;
        yield put(createReservationsSuccess(data));
        toast.success("Create reservation successfully");
    } catch (error) {
        const errorData = error.response?.data;
        const errorMessage = errorData?.message || error.message || "Fail to create reservation";
        yield put(createReservationsFail(errorMessage));
        toast.error(errorMessage);
    }
}

export function* watchCreateReservations() {
    yield takeLatest(createReservationsRequest.type, handleCreateReservation)
}