import {call, put, takeLatest} from "redux-saga/effects";
import { createCheckinSuccess, createCheckinFail, createCheckinRequest } from "./createCheckinSlice";
import { checkInApi } from "../../../../service/staff/parking_sessionApi";
import { getAllReservationRequest } from "../../reservation/getAllReservation/getAllReservationSlice";
import { toast } from "react-toastify";

function* handleCreateCheckin(action) {
    try {
        const response = yield call(checkInApi, action.payload);
        const data = response.data;
        yield put(createCheckinSuccess(data));
        yield put(getAllReservationRequest());
        toast.success("Checkin Success")
    } catch (error) {
        const errorData = error.response?.data;
        const errorMessage =
            errorData?.message || error.message || "Failed to check in";
        yield put(createCheckinFail(errorData));
        toast.error(errorMessage)
    }
}

export function* watchCreateCheckin() {
    yield takeLatest(createCheckinRequest.type, handleCreateCheckin);
}