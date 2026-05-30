import { all } from "redux-saga/effects";
import authSaga from "./auth/authSaga";
import { watchGetAllUser } from "./admin/GetAllUser/GetAllUserSaga";
import { watchChangeStatusUser } from "./admin/ChangeStatusUser/ChangeStatusUserSaga";

export default function* rootSaga() {
  yield all([authSaga(), watchGetAllUser(), watchChangeStatusUser()]);
}
