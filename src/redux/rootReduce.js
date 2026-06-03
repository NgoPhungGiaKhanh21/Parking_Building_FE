import { combineReducers } from "@reduxjs/toolkit";

import authReducer from "./auth/authSlice";
import getAllUserReducer from "./admin/GetAllUser/getAllUserSlice";
import changeStatusUserReducer from "./admin/ChangeStatusUser/ChangeStatusUserSlice";
import changeRoleUserReducer from "./admin/changeRoleUser/changeRoleUserSlice";
import getProfileUserReducer from "./profileUser/getProfileUserSlice";
import changePasswordReducer from "./changePassword/changePasswordSlice";
import createBuildingReducer from "./manager/Building/createBuildingSlice";
import getBuildingListReducer from "./manager/Building/getBuildingListSlice";
import getBuildingDetailReducer from "./manager/Building/getBuildingDetailSlice";
import updateBuildingReducer from "./manager/Building/updateBuildingSlice";
import updateBuildingStatusReducer from "./manager/Building/updateBuildingStatusSlice";
import getBuildingFloorsReducer from "./manager/Building/getBuildingFloorsSlice";
import createFloorReducer from "./manager/Building/createFloorSlice";
import getVehicleTypeListReducer from "./manager/Building/getVehicleTypeListSlice";
import updateFloorReducer from "./manager/Building/updateFloorSlice";
import updateFloorStatusReducer from "./manager/Building/updateFloorStatusSlice";
import updateProfileUserReducer from "./updateProfileUser/updateProfileUserSlice";
import getAllVehicleReducer from "./driver/vehicleManagement/getAllVehicle/getAllVehicleSlice";
import getAllVehicleTypeReducer from "./driver/vehicleManagement/createVehicle/getAllTypeVehicleSlice";
import createVehicleReducer from "./driver/vehicleManagement/createVehicle/createVehicleSlice";
import getVehicleByIdReducer from "./driver/vehicleManagement/getVehicleById/getVehicleByIdSlice";
import updateVehicleReducer from "./driver/vehicleManagement/updateVehicle/updateVehicleSlice";
import deleteVehicleReducer from "./driver/vehicleManagement/deleteVehicle/deleteVehicleSlice";
import getZoneByFloorReducer from "./manager/Building/zone/getZoneByFloor/getZoneByFloorSlice";
import createZoneReducer from "./manager/Building/zone/createZone/createZoneSlice";
import getSlotByZoneReducer from "./manager/Building/zone/getSlotByZone/getSlotByZoneSlice";
import getVehicleManageReducer from "./manager/Vehicle/getVehicleManage/getVehicleManageSlice";

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
  updateBuildingStatus: updateBuildingStatusReducer,
  getBuildingFloors: getBuildingFloorsReducer,
  createFloor: createFloorReducer,
  getVehicleTypeList: getVehicleTypeListReducer,
  updateFloor: updateFloorReducer,
  updateFloorStatus: updateFloorStatusReducer,
  updateProfileUser: updateProfileUserReducer,
  getZoneByFloor: getZoneByFloorReducer,
  createZone: createZoneReducer,
  getSlotByZone: getSlotByZoneReducer,
  getVehicleManage: getVehicleManageReducer,

  //driver
  getAllVehicle: getAllVehicleReducer,
  getVehicleById: getVehicleByIdReducer,
  getAllVehicleType: getAllVehicleTypeReducer,
  createVehicle: createVehicleReducer,
  updateVehicle: updateVehicleReducer,
  deleteVehicle: deleteVehicleReducer,
});

export default rootReducer;
