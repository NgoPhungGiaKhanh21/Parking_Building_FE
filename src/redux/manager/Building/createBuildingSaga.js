import { call, put, takeLatest } from "redux-saga/effects";
import {
  createBuildingFail,
  createBuildingRequest,
  createBuildingSuccess,
} from "./createBuildingSlice";
import { toast } from "react-toastify";
import { createBuildingApi } from "../../../service/manager/buildingApi";

function* handleCreateBuilding(action) {
  try {
    yield call(createBuildingApi, action.payload);
    yield put(createBuildingSuccess());
    toast.success("Building created successfully!");
  } catch (error) {
    const errorData = error.response?.data;
    let errorMessage = "Failed to create building";

    if (errorData) {
      if (errorData.data && Object.keys(errorData.data).length > 0) {
        errorMessage = Object.values(errorData.data)[0];
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
    }

    yield put(createBuildingFail(errorData || errorMessage));
    toast.error(errorMessage);
  }
}
export function* watchCreateBuilding() {
  yield takeLatest(createBuildingRequest.type, handleCreateBuilding);
}
