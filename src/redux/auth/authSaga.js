import { call, put, takeLatest } from "redux-saga/effects";
import { loginApi, registerApi } from "../../service/authApi";
import {
  loginFail,
  loginRequest,
  loginSuccess,
  registerFail,
  registerRequest,
  registerSuccess,
} from "./authSlice";
import { toast } from "react-toastify";

function* handleLogin(action) {
  try {
    const response = yield call(loginApi, action.payload);

    const data = response.data.data;

    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);

    yield put(loginSuccess(data));
    toast.success("Login successful");
  } catch (error) {
    const errorData = error.response?.data;
    let errorMessage = "Wrong username or password";

    if (errorData?.message) {
      errorMessage = errorData.message;
    }

    yield put(loginFail(errorData || "Login failed"));
    toast.error(errorMessage);
  }
}

function* handleRegister(action) {
  try {
    yield call(registerApi, action.payload);
    yield put(registerSuccess());
    toast.success("Register successful");
  } catch (error) {
    const errorData = error.response?.data;
    let errorMessage = "Register failed"; // Lỗi mặc định nếu không parse được API

    if (errorData) {
      // 1. Kiểm tra xem có lỗi chi tiết trong object "data" không (như hình ảnh của bạn)
      if (errorData.data && Object.keys(errorData.data).length > 0) {
        // Lấy message lỗi đầu tiên trong object data hiển thị ra toast
        // Object.values({ fullName: "..." }) sẽ trả về mảng ["..."]
        errorMessage = Object.values(errorData.data)[0];
      }
      // 2. Nếu không có lỗi chi tiết, dùng lỗi chung ở trường "message"
      else if (errorData.message) {
        errorMessage = errorData.message;
      }
    }

    yield put(registerFail(errorData || "Register failed"));
    toast.error(errorMessage);
  }
}

export default function* authSaga() {
  yield takeLatest(loginRequest.type, handleLogin);
  yield takeLatest(registerRequest.type, handleRegister);
}
