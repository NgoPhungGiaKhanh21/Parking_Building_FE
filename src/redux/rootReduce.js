import { combineReducers } from "@reduxjs/toolkit";

import authReducer from "./auth/authSlice";
import getAllUserReducer from "./admin/GetAllUser/GetAllUserSlice";
import changeStatusUserReducer from "./admin/ChangeStatusUser/ChangeStatusUserSlice";
import changeRoleUserReducer from "./admin/changeRoleUser/changeRoleUserSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  getAllUser: getAllUserReducer,
  changeStatusUser: changeStatusUserReducer,
  changeRoleUser: changeRoleUserReducer,
});

export default rootReducer;
