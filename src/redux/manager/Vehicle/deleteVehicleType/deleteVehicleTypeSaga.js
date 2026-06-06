import { call, put, takeLatest } from "redux-saga/effects";
import { deleteVehicleTypeApi } from "../../../../service/manager/vehicleApi";
import { getAllVehicleTypeRequest } from "../../../../redux/driver/vehicleManagement/createVehicle/getAllTypeVehicleSlice";
import {
  deleteVehicleTypeFail,
  deleteVehicleTypeRequest,
  deleteVehicleTypeSuccess,
} from "./deleteVehicleTypeSlice";
import { toast } from "react-toastify";

function* handleDeleteVehicleType(action) {
  try {
    const response = yield call(deleteVehicleTypeApi, action.payload);
    const data = response.data;
    yield put(deleteVehicleTypeSuccess(data));
    yield put(getAllVehicleTypeRequest());
    toast.success("Vehicle type deleted successfully");
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message || error.message || "Failed to delete vehicle type";
    yield put(deleteVehicleTypeFail(errorData || errorMessage));
    toast.error(errorMessage);
  }
}

export function* watchDeteVehicleType() {
  yield takeLatest(deleteVehicleTypeRequest.type, handleDeleteVehicleType);
}
