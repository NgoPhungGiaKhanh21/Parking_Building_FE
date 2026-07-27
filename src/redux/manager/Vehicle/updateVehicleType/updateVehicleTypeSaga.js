import { call, put, takeLatest } from "redux-saga/effects";
import { updateVehicleTypeApi } from "../../../../service/manager/vehicleApi";
import {
  updateVehicleTypeFail,
  updateVehicleTypeRequest,
  updateVehicleTypeSuccess,
} from "./updateVehicleTypeSlice";
import { getAllVehicleTypeRequest } from "../../../driver/vehicleManagement/createVehicle/getAllTypeVehicleSlice";
import { toast } from "react-toastify";

function* handleUpdateVehicleType(action) {
  try {
    const response = yield call(updateVehicleTypeApi, action.payload);
    const data = response.data;
    yield put(updateVehicleTypeSuccess(data));
    yield put(getAllVehicleTypeRequest());
    toast.success("Vehicle type updated successfully!");
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message || error.message || "Failed to update vehicle type";
    yield put(updateVehicleTypeFail(errorData || errorMessage));
    toast.error(errorMessage);
  }
}

export function* watchUpdateVehicleType() {
  yield takeLatest(updateVehicleTypeRequest.type, handleUpdateVehicleType);
}
