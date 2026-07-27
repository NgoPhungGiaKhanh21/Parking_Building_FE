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
    const vehicleId = action.payload.get("vehicleId");
    yield put(getVehicleByIdRequest({ vehicleId }));
    yield put(getAllVehicleRequest());
    toast.success("Vehicle updated successfully");
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message || error.message || "Failed to update vehicle";
    yield put(updateVehicleFail(errorData || errorMessage));
    toast.error(errorMessage);
  }
}

export function* watchUpdateVehicle() {
  yield takeLatest(updateVehicleRequest.type, handleUpdateVehicle);
}
