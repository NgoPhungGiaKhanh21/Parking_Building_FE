import { call, put, takeLatest } from "redux-saga/effects";
import { getAllVehiclesApi } from "../../../../service/Driver/vehicleApi";
import {
  getAllVehicleFail,
  getAllVehicleRequest,
  getAllVehicleSuccess,
} from "./getAllVehicleSlice";
import { toast } from "react-toastify";

function* handleGetAllVehicle(action) {
  try {
    const response = yield call(getAllVehiclesApi, action.payload);

    const data = response.data;
    yield put(getAllVehicleSuccess(data));
  } catch (error) {
    yield put(getAllVehicleFail(error.message));
    toast.error("Failed to fetch vehicles");
  }
}

export function* watchGetAllVehicle() {
  yield takeLatest(getAllVehicleRequest.type, handleGetAllVehicle);
}
