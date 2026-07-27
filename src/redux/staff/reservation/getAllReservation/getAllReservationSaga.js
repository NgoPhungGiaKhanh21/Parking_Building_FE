import { call, put, takeLatest } from "redux-saga/effects";
import { getAllReservationApi } from "../../../../service/staff/reservationApi";
import { normalizeReservation } from "../../../../utils/reservationSessionUtils";
import {
  getAllReservationRequest,
  getAllReservationSuccess,
  getAllReservationFail,
} from "./getAllReservationSlice";
import { toast } from "react-toastify";

function* handleGetAllReservation(action) {
  try {
        const response = yield call(getAllReservationApi, action.payload);
        const raw = response.data?.data ?? response.data;
        const data = Array.isArray(raw)
            ? raw
            : raw?.reservations ?? raw?.content ?? [];
        yield put(getAllReservationSuccess(data.map(normalizeReservation)));
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message || error.message || "Failed to fetch reservations";
    yield put(getAllReservationFail(errorData || errorMessage));
    toast.error(errorMessage);
  }
}

export function* watchGetAllReservation() {
  yield takeLatest(getAllReservationRequest.type, handleGetAllReservation);
}
