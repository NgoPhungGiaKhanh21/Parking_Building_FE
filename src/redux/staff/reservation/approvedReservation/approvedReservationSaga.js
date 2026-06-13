import { call, put, takeLatest, fork } from "redux-saga/effects"
import { approveReservationSuccess, approveReservationFail, approveReservationRequest } from "./approvedReservationSlice";
import { approveReservationApi } from "../../../../service/staff/reservationApi";
import { getAllReservationRequest } from "../getAllReservation/getAllReservationSlice";
import { toast } from "react-toastify";

function* handleApproveReservation(action) {
    try {
        const response = yield call(approveReservationApi, action.payload);
        const data = response.data;
        yield put(approveReservationSuccess(data));
        yield put(getAllReservationRequest());
        toast.success("Approve Reservation Success")
    } catch (error) {
        const errorData = error.response?.data;
        const errorMessage = errorData?.message || error.message || "Approve Reservation Failed";
        yield put(approveReservationFail(errorMessage));
        toast.error(errorMessage);
    }
}

export function* watchApproveReservation() {
    yield takeLatest(approveReservationRequest.type, handleApproveReservation);
}