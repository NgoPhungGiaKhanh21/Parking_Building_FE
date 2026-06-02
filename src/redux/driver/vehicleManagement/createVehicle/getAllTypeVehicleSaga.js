import { call, put, takeLatest } from "redux-saga/effects";
import { getAllVehicleTypesApi } from "../../../../service/Driver/vehicleApi";
import {
  getAllVehicleTypeFail,
  getAllVehicleTypeRequest,
  getAllVehicleTypeSuccess,
} from "./getAllTypeVehicleSlice";
import { toast } from "react-toastify";

function* handleGetAllVehicleType(action) {
  try {
    const response = yield call(getAllVehicleTypesApi, action.payload);

    const data = response.data;
    yield put(getAllVehicleTypeSuccess(data));
  } catch (error) {
    yield put(getAllVehicleTypeFail(error.message));
    toast.error("Failed to fetch vehicle types");
  }
}

export function* watchGetAllVehicleType() {
  yield takeLatest(getAllVehicleTypeRequest.type, handleGetAllVehicleType);
}
