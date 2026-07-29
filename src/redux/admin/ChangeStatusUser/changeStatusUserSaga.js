import { call, put, takeLatest } from "redux-saga/effects";
import { changeStatusUserApi } from "../../../service/admin/changeStatusUserApi";
import {
  changeStatusUserFail,
  changeStatusUserRequest,
  changeStatusUserSuccess,
} from "./changeStatusUserSlice";
import { getAllUserRequest } from "../GetAllUser/getAllUserSlice";
import { toast } from "react-toastify";

function* handleChangeStatusUser(action) {
  try {
    // Truyền thẳng action.payload vào API
    const response = yield call(changeStatusUserApi, action.payload);

    const data = response.data;
    yield put(changeStatusUserSuccess(data));

    toast.success(
      `User status changed to ${action.payload.status} successfully`,
    );

    yield put(getAllUserRequest());
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message || error.message || "Failed to change user status";
    yield put(changeStatusUserFail(errorData || errorMessage));
    toast.error(errorMessage);
  }
}

export function* watchChangeStatusUser() {
  yield takeLatest(changeStatusUserRequest.type, handleChangeStatusUser);
}
