import { call, put, takeLatest } from "redux-saga/effects";
import { updateVehicleApi } from "../../../../service/Driver/vehicleApi";
import { getVehicleByIdRequest } from "../getVehicleById/getVehicleByIdSlice";
import { getAllVehicleRequest } from "../getAllVehicle/getAllVehicleSlice";
import {
  updateVehicleFail,
  updateVehicleRequest,
  updateVehicleSuccess,
} from "./updateVehicleSlice";
import { toast } from "react-toastify";

function* handleUpdateVehicle(action) {
  try {
    const response = yield call(updateVehicleApi, action.payload);

    const data = response.data;
    yield put(updateVehicleSuccess(data));
    yield put(getVehicleByIdRequest({ vehicleId: action.payload.vehicleId }));
    yield put(getAllVehicleRequest());
    toast.success("Vehicle updated successfully");
  } catch (error) {
    yield put(updateVehicleFail(error.message));
    toast.error("Failed to update vehicle");
  }
}

export function* watchUpdateVehicle() {
  yield takeLatest(updateVehicleRequest.type, handleUpdateVehicle);
}
