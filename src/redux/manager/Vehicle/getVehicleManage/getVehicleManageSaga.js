import { call, put, takeLatest } from "redux-saga/effects";
import { getVehicleManageApi } from "../../../../service/manager/vehicleApi";
import {
  getVehicleManageFail,
  getVehicleManageSuccess,
  getVehicleManageRequest,
} from "./getVehicleManageSlice";
import { toast } from "react-toastify";

function* handleGetVehicleManage(action) {
  try {
    const response = yield call(getVehicleManageApi, action.payload);

    const data = response.data.data;
    yield put(getVehicleManageSuccess(data));
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message || error.message || "Failed to fetch vehicle list";
    yield put(getVehicleManageFail(errorData || errorMessage));
    toast.error(errorMessage);
  }
}

export function* watchGetVehicleManage() {
  yield takeLatest(getVehicleManageRequest.type, handleGetVehicleManage);
}
