import { call, put, takeLatest } from "redux-saga/effects";
import { getStaffBuildingApi } from "../../../../service/staff/parking_sessionApi";
import { getStaffBuildingFailure, getStaffBuildingRequest, getStaffBuildingSuccess } from "./getStaffBuildingSlice";
import { toast } from "react-toastify";

function* handleGetStaffBuilding() {
    try {
        const response = yield call(getStaffBuildingApi);
        const data = response.data.data;
        yield put(getStaffBuildingSuccess(data));
    }
    catch (error) {
        yield put(getStaffBuildingFailure(error.response?.data || error.message));
        const errorData = error.response?.data;
        const errorMessage =
            errorData?.message || error.message || "Failed to get staff building";
        toast.error(errorMessage);
    }
}

export function* watchGetStaffBuilding() {
    yield takeLatest(getStaffBuildingRequest.type, handleGetStaffBuilding);
}