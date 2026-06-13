import { call, put, takeLatest } from 'redux-saga/effects';
import { getAllReservationApi } from '../../../../service/staff/reservationApi';
import { getAllReservationRequest, getAllReservationSuccess, getAllReservationFail } from './getAllReservationSlice';
import { toast } from 'react-toastify';

function* handleGetAllReservation(action) {
    try {
        const response = yield call(getAllReservationApi, action.payload);
        const data = response.data.data;
        yield put(getAllReservationSuccess(data));
    } catch (error) {
        const errorData = error.response?.data;
        const errorMessage = errorData?.message || error.message || "Failed to fetch reservations";
        yield put(getAllReservationFail(errorData || errorMessage));
        toast.error(errorMessage);
    }
}

export function* watchGetAllReservation() {
    yield takeLatest(getAllReservationRequest.type, handleGetAllReservation);
}