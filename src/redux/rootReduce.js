import { combineReducers } from "@reduxjs/toolkit";

import authReducer from "./auth/authSlice";
import getAllUserReducer from "./admin/GetAllUser/getAllUserSlice";
import changeStatusUserReducer from "./admin/ChangeStatusUser/ChangeStatusUserSlice";
import changeRoleUserReducer from "./admin/changeRoleUser/changeRoleUserSlice";
import getProfileUserReducer from "./profileUser/getProfileUserSlice";
import changePasswordReducer from "./changePassword/changePasswordSlice";
import createBuildingReducer from "./manager/Building/createBuilding/createBuildingSlice";
import getBuildingListReducer from "./manager/Building/getBuildingList/getBuildingListSlice";
import getBuildingDetailReducer from "./manager/Building/getBuildingDetail/getBuildingDetailSlice";
import updateBuildingReducer from "./manager/Building/updateBuilding/updateBuildingSlice";
import updateBuildingStatusReducer from "./manager/Building/updateBuildingStatus/updateBuildingStatusSlice";
import getBuildingFloorsReducer from "./manager/Building/getBuildingFloors/getBuildingFloorsSlice";
import createFloorReducer from "./manager/Building/createFloor/createFloorSlice";
import getVehicleTypeListReducer from "./manager/Building/getVehicleTypeList/getVehicleTypeListSlice";
import updateFloorReducer from "./manager/Building/updateFloor/updateFloorSlice";
import updateFloorStatusReducer from "./manager/Building/updateFloorStatus/updateFloorStatusSlice";
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
import getStaffListReducer from "./manager/StaffManagement/GetAllStaff/getAllStaffSlice";
import postStaffToBuildingReducer from "./manager/StaffManagement/AssignStaffToBuilding/assignStaffSlice";
import getStaffBuildingsReducer from "./manager/StaffManagement/GetStaffBuildings/getStaffBuildingsSlice";
import getBuildingStaffReducer from "./manager/StaffManagement/GetBuildingStaff/getBuildingStaffSlice";
import removeStaffFromBuildingReducer from "./manager/StaffManagement/RemoveStaffFromBuilding/removeStaffFromBuildingSlice";
import getVehicleManageReducer from "./manager/Vehicle/getVehicleManage/getVehicleManageSlice";
import getAllDriverReducer from "./manager/Vehicle/getAllDriver/getAllDriverSlice";
import changeStatusVehicleReducer from "./manager/Vehicle/changeStatusVehicle/changeStatusVehicleSlice";
import createVehicleTypeReducer from "./manager/Vehicle/createVehicleType/createVehicleTypeSlice";
import updateVehicleTypeReducer from "./manager/Vehicle/updateVehicleType/updateVehicleTypeSlice";
import deleteVehicleTypeReducer from "./manager/Vehicle/deleteVehicleType/deleteVehicleTypeSlice";

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
  getAllStaff: getStaffListReducer,
  postStaffToBuilding: postStaffToBuildingReducer,
  getStaffBuildings: getStaffBuildingsReducer,
  getBuildingStaff: getBuildingStaffReducer,
  removeStaffFromBuilding: removeStaffFromBuildingReducer,
  getVehicleManage: getVehicleManageReducer,
  getAllDriver: getAllDriverReducer,
  changeStatusVehicle: changeStatusVehicleReducer,
  createVehicleType: createVehicleTypeReducer,
  updateVehicleType: updateVehicleTypeReducer,
  deleteVehicleType: deleteVehicleTypeReducer,

  //driver
  getAllVehicle: getAllVehicleReducer,
  getVehicleById: getVehicleByIdReducer,
  getAllVehicleType: getAllVehicleTypeReducer,
  createVehicle: createVehicleReducer,
  updateVehicle: updateVehicleReducer,
  deleteVehicle: deleteVehicleReducer,
});

export default rootReducer;
