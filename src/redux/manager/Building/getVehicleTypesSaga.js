import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import { getVehicleTypesApi } from "../../../service/manager/buildingApi";
import {
  getVehicleTypesFail,
  getVehicleTypesRequest,
  getVehicleTypesSuccess,
} from "./getVehicleTypesSlice";

function* handleGetVehicleTypes() {
  try {
    const response = yield call(getVehicleTypesApi);
    const vehicleTypes = response?.data?.data ?? [];
    yield put(getVehicleTypesSuccess(vehicleTypes));
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message || error.message || "Failed to fetch vehicle types";
    yield put(getVehicleTypesFail(errorData || errorMessage));
    toast.error(errorMessage);
  }
}

export function* watchGetVehicleTypes() {
  yield takeLatest(getVehicleTypesRequest.type, handleGetVehicleTypes);
}
