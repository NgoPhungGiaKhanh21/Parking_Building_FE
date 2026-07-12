import { call, put, takeLatest } from "redux-saga/effects";
import { ocrPlateRequest, ocrPlateSuccess, ocrPlateFailure } from "./ocrPlateSlice";
import { ocrPlateApi } from "../../../service/staff/parking_sessionApi";
import { toast } from "react-toastify";

function* handleOCRPlate(action) {
    try {
        const response = yield call(ocrPlateApi, action.payload);
        const data = response.data;
        yield put(ocrPlateSuccess(data));
        toast.success("Plate number recognized successfully");
    }
    catch (error) {
        yield put(ocrPlateFailure(error.response?.data || error.message));
        const errorData = error.response?.data;
        const errorMessage =
            errorData?.message || error.message || "Failed to recognize plate number";
        toast.error(errorMessage);
    }
}

export function* watchOCRPlate() {
    yield takeLatest(ocrPlateRequest.type, handleOCRPlate);
}