import {call, put, takeLatest} from 'redux-saga/effects';
import {getOccupiedSlotApi} from "../../../../../service/manager/buildingApi"
import {
    getOccupiedSlotRequest,
    getOccupiedSlotSuccess,
    getOccupiedSlotFail
} from './getOccupiedSlotSlice';
import {toast} from 'react-toastify';
function* handleGetOccupiedSlot(action) {
    try {
        const response = yield call(getOccupiedSlotApi, action.payload)
        const data = response.data.data;
        yield put(getOccupiedSlotSuccess(data))
    } catch (error) {
        const errorData = error.response?.data;
        const errorMessage =
        errorData?.message || error.message || "Failed to fetch slot list";
        yield put(getOccupiedSlotFail(errorMessage))
        toast.error(errorMessage);
    }
}

export function* watchGetOccupiedSlot() {
    yield takeLatest(getOccupiedSlotRequest.type, handleGetOccupiedSlot)
}