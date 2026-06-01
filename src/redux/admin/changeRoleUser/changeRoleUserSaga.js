import { call, put, takeLatest } from "redux-saga/effects";
import { changeRoleUserApi } from "../../../service/admin/changeRoleUserApi";
import {
  changeRoleUserFail,
  changeRoleUserRequest,
  changeRoleUserSuccess,
} from "./changeRoleUserSlice";
import { getAllUserRequest } from "../getAllUser/getAllUserSlice";
import { toast } from "react-toastify";

function* handleChangeRoleUser(action) {
  try {
    const response = yield call(changeRoleUserApi, action.payload);
    const data = response.data;
    yield put(changeRoleUserSuccess(data));
    yield put(getAllUserRequest());
    toast.success("Role updated successfully!");
  } catch (error) {
    yield put(changeRoleUserFail(error.message));
    toast.error("Failed to update role.");
  }
}

export function* watchChangeRoleUser() {
  yield takeLatest(changeRoleUserRequest.type, handleChangeRoleUser);
}
