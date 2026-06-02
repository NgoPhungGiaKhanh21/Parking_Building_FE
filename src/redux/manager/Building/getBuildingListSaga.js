import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import { getBuildingListApi } from "../../../service/manager/buildingApi";
import {
  getBuildingListFail,
  getBuildingListRequest,
  getBuildingListSuccess,
} from "./getBuildingListSlice";

function* handleGetBuildingList() {
  try {
    const response = yield call(getBuildingListApi);
    const buildingList = response?.data?.data ?? [];
    yield put(getBuildingListSuccess(buildingList));
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message || error.message || "Failed to fetch building list";
    yield put(getBuildingListFail(errorData || errorMessage));
    toast.error(errorMessage);
  }
}

export function* watchGetBuildingList() {
  yield takeLatest(getBuildingListRequest.type, handleGetBuildingList);
}
