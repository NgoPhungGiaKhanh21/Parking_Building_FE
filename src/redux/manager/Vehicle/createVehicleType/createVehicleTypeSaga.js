import { call, put, takeLatest } from "redux-saga/effects";
import { createVehicleTypeApi } from "../../../../service/manager/vehicleApi";
import {
  createVehicleTypeFail,
  createVehicleTypeRequest,
  createVehicleTypeSuccess,
} from "./createVehicleTypeSlice";
import { getAllVehicleTypeRequest } from "../../../driver/vehicleManagement/createVehicle/getAllTypeVehicleSlice";
import { toast } from "react-toastify";

function* handleCreateVehicleType(action) {
  try {
    const response = yield call(createVehicleTypeApi, action.payload);
    const data = response.data;
    yield put(createVehicleTypeSuccess(data));
    yield put(getAllVehicleTypeRequest());
    toast.success("Vehicle type created successfully");
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message || error.message || "Failed to create vehicle type";
    yield put(createVehicleTypeFail(errorData || errorMessage));
    toast.error(errorMessage);
  }
}

export function* watchCreateVehicleType() {
  yield takeLatest(createVehicleTypeRequest.type, handleCreateVehicleType);
}
