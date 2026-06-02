import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import { createBuildingFloorApi } from "../../../service/manager/buildingApi";
import {
  createFloorFail,
  createFloorRequest,
  createFloorSuccess,
} from "./createFloorSlice";

function* handleCreateFloor(action) {
  try {
    const { buildingId, data } = action.payload;
    yield call(createBuildingFloorApi, buildingId, data);
    yield put(createFloorSuccess());
    toast.success("Floor created successfully!");
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message || error.message || "Failed to create floor";
    yield put(createFloorFail(errorData || errorMessage));
    toast.error(errorMessage);
  }
}

export function* watchCreateFloor() {
  yield takeLatest(createFloorRequest.type, handleCreateFloor);
}
