import { call, put, takeLatest } from "redux-saga/effects";
import { getVehicleByIdApi } from "../../../../service/driver/vehicleApi";
import {
  getVehicleByIdFail,
  getVehicleByIdRequest,
  getVehicleByIdSuccess,
} from "./getVehicleByIdSlice";
import { toast } from "react-toastify";

function* handleGetVehicleById(action) {
  try {
    const response = yield call(getVehicleByIdApi, action.payload);
    const data = response.data;
    yield put(getVehicleByIdSuccess(data));
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message || error.message || "Failed to fetch vehicle details";
    yield put(getVehicleByIdFail(errorData || errorMessage));
    toast.error(errorMessage);
  }
}

export function* watchGetVehicleById() {
  yield takeLatest(getVehicleByIdRequest.type, handleGetVehicleById);
}
