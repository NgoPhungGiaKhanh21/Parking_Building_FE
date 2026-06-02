import { call, put, takeLatest } from "redux-saga/effects";
import { updateProfileUserApi } from "../../service/profileUser/updateProfileUserApi";
import {
  updateProfileUserFail,
  updateProfileUserRequest,
  updateProfileUserSuccess,
} from "./updateProfileUserSlice";
import { getProfileUserRequest } from "../profileUser/getProfileUserSlice";
import { toast } from "react-toastify";

function* handleUpdateProfileUser(action) {
  try {
    const response = yield call(updateProfileUserApi, action.payload);
    const data = response.data;
    yield put(updateProfileUserSuccess(data));
    toast.success("Profile updated successfully");
    yield put(getProfileUserRequest());
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message || error.message || "Failed to update profile";
    yield put(updateProfileUserFail(errorData || errorMessage));
    toast.error(errorMessage);
  }
}

export function* watchUpdateProfileUser() {
  yield takeLatest(updateProfileUserRequest.type, handleUpdateProfileUser);
}
