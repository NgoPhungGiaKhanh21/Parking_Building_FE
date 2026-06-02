import { call, put, takeLatest } from "redux-saga/effects";
import { deleteVehicleApi } from "../../../../service/Driver/vehicleApi";
import { getAllVehicleRequest } from "../getAllVehicle/getAllVehicleSlice";
import {
  deleteVehicleFail,
  deleteVehicleRequest,
  deleteVehicleSuccess,
} from "./deleteVehicleSlice";
import { toast } from "react-toastify";

function* handleDeleteVehicle(action) {
  try {
    const response = yield call(deleteVehicleApi, action.payload);

    const data = response.data;
    yield put(deleteVehicleSuccess(data));
    yield put(getAllVehicleRequest());
    toast.success("Vehicle deleted successfully");
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message || error.message || "Failed to delete vehicle";
    yield put(deleteVehicleFail(errorData || errorMessage));
    toast.error(errorMessage);
  }
}

export function* watchDeleteVehicle() {
  yield takeLatest(deleteVehicleRequest.type, handleDeleteVehicle);
}
