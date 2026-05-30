import { combineReducers } from "@reduxjs/toolkit";

import authReducer from "./auth/authSlice";
import getAllUserReducer from "./admin/GetAllUser/GetAllUserSlice";
import changeStatusUserReducer from "./admin/ChangeStatusUser/ChangeStatusUserSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  getAllUser: getAllUserReducer,
  changeStatusUser: changeStatusUserReducer,
});

export default rootReducer;
