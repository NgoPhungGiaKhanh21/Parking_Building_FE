import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import { createBuildingFloorApi } from "../../../../service/manager/buildingApi";
import {
  createBuildingFloorFail,
  createBuildingFloorRequest,
  createBuildingFloorSuccess,
} from "./createBuildingFloorSlice";

function* handleCreateBuildingFloor(action) {
  try {
    const { buildingId, data } = action.payload;
    yield call(createBuildingFloorApi, buildingId, data);
    yield put(createBuildingFloorSuccess());
    toast.success("Floor created successfully!");
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message || error.message || "Failed to create floor";
    yield put(createBuildingFloorFail(errorData || errorMessage));
    toast.error(errorMessage);
  }
}

export function* watchCreateBuildingFloor() {
  yield takeLatest(createBuildingFloorRequest.type, handleCreateBuildingFloor);
}
