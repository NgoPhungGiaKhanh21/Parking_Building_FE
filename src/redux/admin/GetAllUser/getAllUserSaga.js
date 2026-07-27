import { call, put, takeLatest } from "redux-saga/effects";
import { getAllUserApi } from "../../../service/admin/getAllUserApi";
import {
  getAllUserFail,
  getAllUserRequest,
  getAllUserSuccess,
} from "./getAllUserSlice";
import { toast } from "react-toastify";

function* handleGetAllUser(action) {
  try {
    const response = yield call(getAllUserApi, action.payload);

    const data = response.data;
    yield put(getAllUserSuccess(data));
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message || error.message || "Failed to fetch users";
    yield put(getAllUserFail(errorData || errorMessage));
    toast.error(errorMessage);
  }
}

export function* watchGetAllUser() {
  yield takeLatest(getAllUserRequest.type, handleGetAllUser);
}
