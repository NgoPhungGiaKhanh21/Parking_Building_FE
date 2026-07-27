import { call, put, takeLatest } from "redux-saga/effects";
import { removeStaffFromBuildingApi } from "../../../../service/manager/staffManagementAPI";
import {
  removeStaffFromBuildingFail,
  removeStaffFromBuildingRequest,
  removeStaffFromBuildingSuccess,
} from "./removeStaffFromBuildingSlice";
import { toast } from "react-toastify";

function* removeStaffFromBuildingSaga(action) {
  try {
    yield call(removeStaffFromBuildingApi, action.payload);
    yield put(removeStaffFromBuildingSuccess());
    toast.success("Staff removed from building successfully!");
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message ||
      error.message ||
      "Failed to remove staff from building";
    yield put(removeStaffFromBuildingFail(errorData || errorMessage));
    toast.error(errorMessage);
  }
}

export function* watchRemoveStaffFromBuilding() {
  yield takeLatest(
    removeStaffFromBuildingRequest.type,
    removeStaffFromBuildingSaga
  );
}
