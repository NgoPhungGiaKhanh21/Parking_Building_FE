import { call, put, takeLatest } from "redux-saga/effects";
import { changeStatusUserApi } from "../../../service/admin/changeStatusUserApi";
import {
  changeStatusUserFail,
  changeStatusUserRequest,
  changeStatusUserSuccess,
} from "./ChangeStatusUserSlice";
import { getAllUserRequest } from "../GetAllUser/getAllUserSlice"; // Import action lấy danh sách user
import { toast } from "react-toastify";

function* handleChangeStatusUser(action) {
  try {
    // Truyền thẳng action.payload vào API
    const response = yield call(changeStatusUserApi, action.payload);

    const data = response.data;
    yield put(changeStatusUserSuccess(data));

    // Hiển thị thông báo trạng thái vừa chuyển
    toast.success(
      `User status changed to ${action.payload.status} successfully`,
    );

    // Tự động load lại danh sách user để cập nhật bảng
    yield put(getAllUserRequest());
  } catch (error) {
    yield put(changeStatusUserFail(error.message));
    toast.error("Failed to change user status");
    console.error("LỖI ĐỔI TRẠNG THÁI:", error);
  }
}

export function* watchChangeStatusUser() {
  yield takeLatest(changeStatusUserRequest.type, handleChangeStatusUser);
}
