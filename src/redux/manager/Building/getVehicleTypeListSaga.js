import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import { getVehicleTypesApi } from "../../../service/manager/buildingApi";
import {
  getVehicleTypeListFail,
  getVehicleTypeListRequest,
  getVehicleTypeListSuccess,
} from "./getVehicleTypeListSlice";

function* handleGetVehicleTypeList() {
  try {
    const response = yield call(getVehicleTypesApi);
    const vehicleTypes = response?.data?.data ?? [];
    yield put(getVehicleTypeListSuccess(vehicleTypes));
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message || error.message || "Failed to fetch vehicle types";
    yield put(getVehicleTypeListFail(errorData || errorMessage));
    toast.error(errorMessage);
  }
}

export function* watchGetVehicleTypeList() {
  yield takeLatest(getVehicleTypeListRequest.type, handleGetVehicleTypeList);
}
