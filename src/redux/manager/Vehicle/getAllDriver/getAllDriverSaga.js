import { call, put, takeLatest } from "redux-saga/effects";
import { getAllDriverApi } from "../../../../service/manager/vehicleApi";
import {
  getAllDriverFail,
  getAllDriverRequest,
  getAllDriverSuccess,
} from "./getAllDriverSlice";
import { toast } from "react-toastify";

function* handleGetAllDriver(action) {
  try {
    const response = yield call(getAllDriverApi, action.payload);

    const data = response.data.data;
    yield put(getAllDriverSuccess(data));
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message || error.message || "Failed to fetch driver list";
    yield put(getAllDriverFail(errorData || errorMessage));
    toast.error(errorMessage);
  }
}

export function* watchGetAllDriver() {
  yield takeLatest(getAllDriverRequest.type, handleGetAllDriver);
}
