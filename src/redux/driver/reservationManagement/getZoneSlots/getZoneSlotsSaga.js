import { call, put, takeLatest } from "redux-saga/effects";
import { getZoneSlotsApi } from "../../../../service/Driver/revervationApi";
import {
    getZoneSlotsRequest,
    getZoneSlotsSuccess,
    getZoneSlotsFail,
} from "./getZoneSlotsSlice";
import { toast } from "react-toastify";

function* handleGetZoneSlots(action) {
    try {
        // action.payload = zoneId (string)
        const response = yield call(getZoneSlotsApi, action.payload);
        yield put(getZoneSlotsSuccess(response.data.data));
    } catch (error) {
        const message =
            error.response?.data?.message ||
            error.message ||
            "Failed to fetch zone slots";
        yield put(getZoneSlotsFail(message));
        toast.error(message);
    }
}

export function* watchGetZoneSlots() {
    yield takeLatest(getZoneSlotsRequest.type, handleGetZoneSlots);
}
