import { combineReducers } from "@reduxjs/toolkit";

import authReducer from "./auth/authSlice";
import getAllUserReducer from "./admin/GetAllUser/GetAllUserSlice";
import changeStatusUserReducer from "./admin/ChangeStatusUser/ChangeStatusUserSlice";
import changeRoleUserReducer from "./admin/changeRoleUser/changeRoleUserSlice";
import getProfileUserReducer from "./profileUser/getProfileUserSlice";
import changePasswordReducer from "./changePassword/changePasswordSlice";
import createBuildingReducer from "./manager/Building/createBuildingSlice";
import getBuildingListReducer from "./manager/Building/getBuildingListSlice";
import getBuildingDetailReducer from "./manager/Building/getBuildingDetailSlice";
import updateBuildingReducer from "./manager/Building/updateBuildingSlice";
import getBuildingFloorsReducer from "./manager/Building/getBuildingFloorsSlice";
import createFloorReducer from "./manager/Building/createFloorSlice";
import getVehicleTypeListReducer from "./manager/Building/getVehicleTypeListSlice";
import updateFloorReducer from "./manager/Building/updateFloorSlice";
import updateProfileUserReducer from "./updateProfileUser/updateProfileUserSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  getAllUser: getAllUserReducer,
  changeStatusUser: changeStatusUserReducer,
  changeRoleUser: changeRoleUserReducer,
  getProfileUser: getProfileUserReducer,
  changePassword: changePasswordReducer,
  createBuilding: createBuildingReducer,
  getBuildingList: getBuildingListReducer,
  getBuildingDetail: getBuildingDetailReducer,
  updateBuilding: updateBuildingReducer,
  getBuildingFloors: getBuildingFloorsReducer,
  createFloor: createFloorReducer,
  getVehicleTypeList: getVehicleTypeListReducer,
  updateFloor: updateFloorReducer,
  updateProfileUser: updateProfileUserReducer,
});

export default rootReducer;
