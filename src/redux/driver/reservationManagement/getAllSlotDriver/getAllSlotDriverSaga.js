import { call, put, takeLatest } from "redux-saga/effects"
import { getAllSlotsApi } from "../../../../service/driver/revervationApi"
import {
    getAllSlotDriverFail,
    getAllSlotDriverRequest,
    getAllSlotDriverSuccess
} from "./getAllSlotDriverSlice"
import { toast } from "react-toastify"

function* handleGetAllSlotDriver(action) {
    try {
        const response = yield call(getAllSlotsApi, action.payload)
        const data = response.data.data;
        yield put(getAllSlotDriverSuccess(data));
    } catch (error) {
        const errorData = error.response?.data;
        const errorMessage = errorData?.message || error.message || "Fail to get all slots";
        yield put(getAllSlotDriverFail(errorMessage));
        toast.error(errorMessage);
    }
}

export function* watchGetAllSlotDriver() {
    yield takeLatest(getAllSlotDriverRequest.type, handleGetAllSlotDriver)
}