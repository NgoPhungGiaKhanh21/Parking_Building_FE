import { call, put, takeLatest } from "redux-saga/effects";
import { changeRoleUserApi } from "../../../service/admin/changeRoleUserApi";
import {
  changeRoleUserFail,
  changeRoleUserRequest,
  changeRoleUserSuccess,
} from "./changeRoleUserSlice";
import { getAllUserRequest } from "../GetAllUser/getAllUserSlice";
import { toast } from "react-toastify";

function* handleChangeRoleUser(action) {
  try {
    const response = yield call(changeRoleUserApi, action.payload);
    const data = response.data;
    yield put(changeRoleUserSuccess(data));
    yield put(getAllUserRequest());
    toast.success("Role updated successfully!");
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message || error.message || "Failed to update role";
    yield put(changeRoleUserFail(errorData || errorMessage));
    toast.error(errorMessage);
  }
}

export function* watchChangeRoleUser() {
  yield takeLatest(changeRoleUserRequest.type, handleChangeRoleUser);
}
