import { all, call, put, takeLatest } from "redux-saga/effects";
import {
  getAllStaffApi,
  getStaffBuildingsApi,
} from "../../../../service/manager/staffManagementAPI";
import {
  getAllStaffFail,
  getAllStaffRequest,
  getAllStaffSuccess,
} from "./getAllStaffSlice";
import { toast } from "react-toastify";

const getStaffId = (staff) => staff?.userId || staff?.staffId || staff?.id;

function* enrichStaffWithBuildings(staff) {
  const userId = getStaffId(staff);
  if (!userId) return staff;

  try {
    const response = yield call(getStaffBuildingsApi, userId);
    const buildings = response?.data?.data ?? [];
    const buildingNames = buildings
      .map((b) => b?.name || b?.buildingName)
      .filter(Boolean)
      .join(", ");

    return { ...staff, buildings, buildingNames };
  } catch {
    return staff;
  }
}

function* getAllStaffSaga() {
  try {
    const response = yield call(getAllStaffApi);
    const staffList = response?.data?.data ?? [];
    const enrichedStaff = yield all(
      staffList.map((staff) => call(enrichStaffWithBuildings, staff))
    );
    yield put(getAllStaffSuccess(enrichedStaff));
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message || error.message || "Failed to fetch staff list";
    yield put(getAllStaffFail(error.message || "Failed to fetch staff list"));
    toast.error(errorMessage);
  }
}

export function* watchGetAllStaff() {
  yield takeLatest(getAllStaffRequest.type, getAllStaffSaga);
}
