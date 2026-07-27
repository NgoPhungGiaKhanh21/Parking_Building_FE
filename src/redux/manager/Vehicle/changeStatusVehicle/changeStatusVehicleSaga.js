import { call, put, takeLatest } from "redux-saga/effects";
import { changeStatusVehicleApi } from "../../../../service/manager/vehicleApi";
import { getVehicleManageRequest } from "../../Vehicle/getVehicleManage/getVehicleManageSlice";
import { toast } from "react-toastify";
import {
  changeStatusVehicleFail,
  changeStatusVehicleRequest,
  changeStatusVehicleSuccess,
} from "./changeStatusVehicleSlice";

import { getAllVehicleRequest } from "../../Vehicle/getAllVehicle/getAllVehicleSlice";

function* handleChangeStatusVehicle(action) {
  try {
    const response = yield call(changeStatusVehicleApi, action.payload);

    const data = response.data;
    yield put(changeStatusVehicleSuccess(data));
    yield put(getVehicleManageRequest(action.payload.userId));
    yield put(getAllVehicleRequest());
    toast.success("Status updated successfully!");
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message || error.message || "Failed to update status";
    yield put(changeStatusVehicleFail(errorData || errorMessage));
    toast.error(errorMessage);
  }
}
export function* watchChangeStatusVehicle() {
  yield takeLatest(changeStatusVehicleRequest.type, handleChangeStatusVehicle);
}
