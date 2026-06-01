import { call, put, takeLatest } from "redux-saga/effects";
import { getProfileUserApi } from "../../service/profileUser/getProfileUserApi";
import {
  getProfileUserFail,
  getProfileUserRequest,
  getProfileUserSuccess,
} from "./getProfileUserSlice";
import { toast } from "react-toastify";

function* handleGetProfileUser(action) {
  try {
    const response = yield call(getProfileUserApi, action.payload);

    const data = response.data.data;
    yield put(getProfileUserSuccess(data));
  } catch (error) {
    yield put(getProfileUserFail(error.message));
    toast.error("Failed to fetch user profile");
  }
}

export function* watchGetProfileUser() {
  yield takeLatest(getProfileUserRequest.type, handleGetProfileUser);
}
