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
    yield put(getAllUserFail(error.message));
    toast.error("Failed to fetch users");
  }
}

export function* watchGetAllUser() {
  yield takeLatest(getAllUserRequest.type, handleGetAllUser);
}
