import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import { getBuildingDetailApi } from "../../../../service/manager/buildingApi";
import {
  getBuildingDetailFail,
  getBuildingDetailRequest,
  getBuildingDetailSuccess,
} from "./getBuildingDetailSlice";

function* handleGetBuildingDetail(action) {
  try {
    const response = yield call(getBuildingDetailApi, action.payload);
    const buildingDetail = response?.data?.data ?? null;
    yield put(getBuildingDetailSuccess(buildingDetail));
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message || error.message || "Failed to fetch building detail";
    yield put(getBuildingDetailFail(errorData || errorMessage));
    toast.error(errorMessage);
  }
}

export function* watchGetBuildingDetail() {
  yield takeLatest(getBuildingDetailRequest.type, handleGetBuildingDetail);
}
