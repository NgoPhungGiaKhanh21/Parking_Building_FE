import { call, put, takeLatest } from "redux-saga/effects";
import { updateZoneApi } from "../../../../../service/manager/buildingApi"
import { updateZoneFail, updateZoneRequest, updateZoneSuccess } from "./updateZoneSlice";
import { getZoneByFloorRequest } from "../getZoneByFloor/getZoneByFloorSlice";
import { toast } from "react-toastify";

function* handleUpdateZone(action) {
    try {
        const response = yield call(updateZoneApi, action.payload)
        const data = response.data;

        yield put(updateZoneSuccess(data))
        yield put(getZoneByFloorRequest(action.payload.floorId))
        toast.success("Update zone successfully")
    } catch (error) {
        const errorData = error.response?.data;
        const errorMessage = errorData?.message || error.message || "Failed to update zone";
        yield put(updateZoneFail(errorData || errorMessage))
        toast.error(errorMessage);
    }
}

export function* watchUpdateZone() {
    yield takeLatest(updateZoneRequest.type, handleUpdateZone)
}

