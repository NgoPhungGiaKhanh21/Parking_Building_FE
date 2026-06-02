import { call, put, takeLatest } from "redux-saga/effects";
import { createVehicleApi } from "../../../../service/Driver/vehicleApi";
import {
  createVehicleFail,
  createVehicleRequest,
  createVehicleSuccess,
} from "./createVehicleSlice";
import { toast } from "react-toastify";

function* handleCreateVehicle(action) {
  try {
    const response = yield call(createVehicleApi, action.payload);
    const data = response.data;
    yield put(createVehicleSuccess(data));
    toast.success("Vehicle created successfully");
  } catch (error) {
    yield put(createVehicleFail(error.response?.data?.message));
    toast.error("Failed to create vehicle");
  }
}

export function* watchCreateVehicle() {
  yield takeLatest(createVehicleRequest.type, handleCreateVehicle);
}
