import { all } from "redux-saga/effects";
import authSaga from "./auth/authSaga";
import { watchGetAllUser } from "./admin/GetAllUser/GetAllUserSaga";
import { watchChangeStatusUser } from "./admin/ChangeStatusUser/ChangeStatusUserSaga";
import { watchChangeRoleUser } from "./admin/changeRoleUser/changeRoleUserSaga";
import { watchGetProfileUser } from "./profileUser/getProfileUserSaga";
import { watchChangePassword } from "./changePassword/changePasswordSaga";
export default function* rootSaga() {
  yield all([
    authSaga(),
    watchGetAllUser(),
    watchChangeStatusUser(),
    watchChangeRoleUser(),
    watchGetProfileUser(),
    watchChangePassword(),
  ]);
}
