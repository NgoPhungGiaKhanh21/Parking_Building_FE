import { call, put, takeLatest } from "redux-saga/effects";
import { getAvailableBuildingsApi } from "../../../../service/Driver/revervationApi";
import {
    getAvailableBuildingsRequest,
    getAvailableBuildingsSuccess,
    getAvailableBuildingsFail,
} from "./getAvailableBuildingsSlice";
import { toast } from "react-toastify";

function* handleGetAvailableBuildings() {
    try {
        const response = yield call(getAvailableBuildingsApi);
        yield put(getAvailableBuildingsSuccess(response.data.data));
    } catch (error) {
        const message =
            error.response?.data?.message ||
            error.message ||
            "Failed to fetch available buildings";
        yield put(getAvailableBuildingsFail(message));
        toast.error(message);
    }
}

export function* watchGetAvailableBuildings() {
    yield takeLatest(getAvailableBuildingsRequest.type, handleGetAvailableBuildings);
}
