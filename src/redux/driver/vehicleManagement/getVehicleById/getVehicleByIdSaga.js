import { call, put, takeLatest } from "redux-saga/effects";
import { getVehicleByIdApi } from "../../../../service/Driver/vehicleApi";
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
    yield put(getVehicleByIdFail(error.message));
    toast.error("Failed to fetch vehicle details");
  }
}

export function* watchGetVehicleById() {
  yield takeLatest(getVehicleByIdRequest.type, handleGetVehicleById);
}
