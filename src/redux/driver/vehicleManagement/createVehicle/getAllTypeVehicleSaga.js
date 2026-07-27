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
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message || error.message || "Failed to fetch vehicle types";
    yield put(getAllVehicleTypeFail(errorData || errorMessage));
    toast.error(errorMessage);
  }
}

export function* watchGetAllVehicleType() {
  yield takeLatest(getAllVehicleTypeRequest.type, handleGetAllVehicleType);
}
