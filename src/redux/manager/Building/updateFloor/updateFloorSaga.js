import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import { updateFloorApi } from "../../../../service/manager/buildingApi";
import {
  updateFloorFail,
  updateFloorRequest,
  updateFloorSuccess,
} from "./updateFloorSlice";

function* handleUpdateFloor(action) {
  try {
    const { floorId, data } = action.payload;
    yield call(updateFloorApi, floorId, data);
    yield put(updateFloorSuccess());
    toast.success("Floor updated successfully!");
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message || error.message || "Failed to update floor";
    yield put(updateFloorFail(errorData || errorMessage));
    toast.error(errorMessage);
  }
}

export function* watchUpdateFloor() {
  yield takeLatest(updateFloorRequest.type, handleUpdateFloor);
}
