import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import { updateBuildingApi } from "../../../service/manager/buildingApi";
import {
  updateBuildingFail,
  updateBuildingRequest,
  updateBuildingSuccess,
} from "./updateBuildingSlice";

function* handleUpdateBuilding(action) {
  try {
    const { buildingId, data } = action.payload;
    yield call(updateBuildingApi, buildingId, data);
    yield put(updateBuildingSuccess());
    toast.success("Building updated successfully!");
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message || error.message || "Failed to update building";
    yield put(updateBuildingFail(errorData || errorMessage));
    toast.error(errorMessage);
  }
}

export function* watchUpdateBuilding() {
  yield takeLatest(updateBuildingRequest.type, handleUpdateBuilding);
}
