import { call, put, takeLatest } from "redux-saga/effects";
import { getSlotListApi } from "../../../../../service/manager/buildingApi";
import {
  getSlotByZoneRequest,
  getSlotByZoneSuccess,
  getSlotByZoneFail,
} from "./getSlotByZoneSlice";
import { toast } from "react-toastify";

function* handleGetSlotByZone(action) {
  try {
    const response = yield call(getSlotListApi, action.payload);

    const data = response.data.data;
    yield put(getSlotByZoneSuccess(data));
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message || error.message || "Failed to fetch slot list";
    yield put(getSlotByZoneFail(errorData || errorMessage));
    toast.error(errorMessage);
  }
}
export function* watchGetSlotByZone() {
  yield takeLatest(getSlotByZoneRequest.type, handleGetSlotByZone);
}
