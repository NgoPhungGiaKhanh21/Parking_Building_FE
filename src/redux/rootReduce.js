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
import getAllVehicleReducer from "./driver/vehicleManagement/getAllVehicle/getAllVehicleSlice";
import getAllVehicleTypeReducer from "./driver/vehicleManagement/createVehicle/getAllTypeVehicleSlice";
import createVehicleReducer from "./driver/vehicleManagement/createVehicle/createVehicleSlice";
import getVehicleByIdReducer from "./driver/vehicleManagement/getVehicleById/getVehicleByIdSlice";
import updateVehicleReducer from "./driver/vehicleManagement/updateVehicle/updateVehicleSlice";
import deleteVehicleReducer from "./driver/vehicleManagement/deleteVehicle/deleteVehicleSlice";

const rootReducer = combineReducers({
  //login - register
  auth: authReducer,

  //admin
  getAllUser: getAllUserReducer,
  changeStatusUser: changeStatusUserReducer,
  changeRoleUser: changeRoleUserReducer,
  getProfileUser: getProfileUserReducer,
  changePassword: changePasswordReducer,

  //manager
  createBuilding: createBuildingReducer,
  getBuildingList: getBuildingListReducer,
  getBuildingDetail: getBuildingDetailReducer,
  updateBuilding: updateBuildingReducer,
  getBuildingFloors: getBuildingFloorsReducer,
  createFloor: createFloorReducer,
  getVehicleTypeList: getVehicleTypeListReducer,
  updateFloor: updateFloorReducer,
  updateProfileUser: updateProfileUserReducer,

  //driver
  getAllVehicle: getAllVehicleReducer,
  getVehicleById: getVehicleByIdReducer,
  getAllVehicleType: getAllVehicleTypeReducer,
  createVehicle: createVehicleReducer,
  updateVehicle: updateVehicleReducer,
  deleteVehicle: deleteVehicleReducer,
});

export default rootReducer;
