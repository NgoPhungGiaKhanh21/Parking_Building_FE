import { call, put, takeLatest } from "redux-saga/effects";
import { getBuildingFloorsApi } from "../../../../service/Driver/revervationApi";
import {
    getBuildingFloorsRequest,
    getBuildingFloorsSuccess,
    getBuildingFloorsFail,
} from "./getBuildingFloorsSlice";
import { toast } from "react-toastify";

function* handleGetBuildingFloors(action) {
    try {
        const response = yield call(getBuildingFloorsApi, action.payload);
        // response.data.data = array of floors
        yield put(getBuildingFloorsSuccess(response.data.data));
    } catch (error) {
        const message =
            error.response?.data?.message ||
            error.message ||
            "Failed to fetch building floors";
        yield put(getBuildingFloorsFail(message));
        toast.error(message);
    }
}

export function* watchGetBuildingFloors() {
    yield takeLatest(getBuildingFloorsRequest.type, handleGetBuildingFloors);
}
