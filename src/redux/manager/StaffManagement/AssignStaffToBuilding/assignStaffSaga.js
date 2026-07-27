import { call, put, takeLatest } from "redux-saga/effects";
import { postStaffToBuildingApi } from "../../../../service/manager/staffManagementAPI";
import {
  assignStaffFail,
  assignStaffRequest,
  assignStaffSuccess,
} from "./assignStaffSlice";
import { toast } from "react-toastify";

function* watchAssignStaffToBuilding(action) {
  try {
    yield call(postStaffToBuildingApi, action.payload);
    yield put(assignStaffSuccess());
    toast.success("Staff assigned to building successfully!");
  } catch (error) {
    yield put(
      assignStaffFail(
        error.response?.data || "Failed to assign staff to building"
      )
    );
    const errorData = error.response?.data;
    toast.error(errorData?.message || "Failed to assign staff to building");
  }
}
export function* watchAssignStaff() {
  yield takeLatest(assignStaffRequest.type, watchAssignStaffToBuilding);
}
