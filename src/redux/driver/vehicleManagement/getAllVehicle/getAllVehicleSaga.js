import { call, put, takeLatest } from "redux-saga/effects";
import { getAllVehiclesApi } from "../../../../service/driver/vehicleApi";
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
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message || error.message || "Failed to fetch vehicles";
    yield put(getAllVehicleFail(errorMessage));
    toast.error(errorMessage);
  }
}

export function* watchGetAllVehicle() {
  yield takeLatest(getAllVehicleRequest.type, handleGetAllVehicle);
}
