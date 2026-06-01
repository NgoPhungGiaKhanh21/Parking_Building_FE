import { combineReducers } from "@reduxjs/toolkit";

import authReducer from "./auth/authSlice";
import getAllUserReducer from "./admin/GetAllUser/GetAllUserSlice";
import changeStatusUserReducer from "./admin/ChangeStatusUser/ChangeStatusUserSlice";
import changeRoleUserReducer from "./admin/changeRoleUser/changeRoleUserSlice";
import getProfileUserReducer from "./profileUser/getProfileUserSlice";
import changePasswordReducer from "./changePassword/changePasswordSlice";
import updateProfileUserReducer from "./updateProfileUser/updateProfileUserSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  getAllUser: getAllUserReducer,
  changeStatusUser: changeStatusUserReducer,
  changeRoleUser: changeRoleUserReducer,
  getProfileUser: getProfileUserReducer,
  changePassword: changePasswordReducer,
  updateProfileUser: updateProfileUserReducer,
});

export default rootReducer;
