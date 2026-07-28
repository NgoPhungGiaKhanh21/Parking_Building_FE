import { call, put, takeLatest, select } from "redux-saga/effects";
import { ocrPlateRequest, ocrPlateSuccess, ocrPlateFailure } from "./ocrPlateSlice";
import { ocrPlateApi } from "../../../service/staff/parking_sessionApi";
import { isStaffVehiclePageMounted } from "../../../utils/staffVehiclePageGuard";
import { toast } from "react-toastify";

function* handleOCRPlate(action) {
    const epoch = yield select((state) => state.ocrPlate.epoch);
    try {
        const response = yield call(ocrPlateApi, action.payload);
        const data = response.data;
        yield put(ocrPlateSuccess({ data, epoch }));
        if (isStaffVehiclePageMounted()) {
            toast.success("Plate number recognized successfully");
        }
    }
    catch (error) {
        yield put(ocrPlateFailure({
            epoch,
            error: error.response?.data || error.message,
        }));
        if (isStaffVehiclePageMounted()) {
            const errorData = error.response?.data;
            const errorMessage =
                errorData?.message || error.message || "Failed to recognize plate number";
            toast.error(errorMessage);
        }
    }
}

export function* watchOCRPlate() {
    yield takeLatest(ocrPlateRequest.type, handleOCRPlate);
}