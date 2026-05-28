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

    const data = response.data;

    localStorage.setItem("token", data.token);

    yield put(loginSuccess(data));
    toast.success("Login successful");
  } catch (error) {
    yield put(loginFail(error.response?.data || "Login failed"));
    toast.error("Wrong username or password");
  }
}

function* handleRegister(action) {
  try {
    yield call(registerApi, action.payload);
    yield put(registerSuccess());
    toast.success("Register successful");
  } catch (error) {
    yield put(registerFail(error.response?.data || "Register failed"));
    toast.error("Register failed");
  }
}
export default function* authSaga() {
  yield takeLatest(loginRequest.type, handleLogin);
  yield takeLatest(registerRequest.type, handleRegister);
}
