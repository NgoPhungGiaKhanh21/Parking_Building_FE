import { all } from "redux-saga/effects";
import authSaga from "./auth/authSaga";
import { watchGetAllUser } from "./admin/GetAllUser/GetAllUserSaga";
import { watchChangeStatusUser } from "./admin/ChangeStatusUser/ChangeStatusUserSaga";
import { watchChangeRoleUser } from "./admin/changeRoleUser/changeRoleUserSaga";
import { watchGetProfileUser } from "./profileUser/getProfileUserSaga";
import { watchChangePassword } from "./changePassword/changePasswordSaga";
import { watchCreateBuilding } from "./manager/Building/createBuilding/createBuildingSaga";
import { watchGetBuildingList } from "./manager/Building/getBuildingList/getBuildingListSaga";
import { watchGetBuildingDetail } from "./manager/Building/getBuildingDetail/getBuildingDetailSaga";
import { watchUpdateBuilding } from "./manager/Building/updateBuilding/updateBuildingSaga";
import { watchUpdateBuildingStatus } from "./manager/Building/updateBuildingStatus/updateBuildingStatusSaga";
import { watchGetBuildingFloors } from "./manager/Building/getBuildingFloors/getBuildingFloorsSaga";
import { watchCreateFloor } from "./manager/Building/createFloor/createFloorSaga";
import { watchGetVehicleTypeList } from "./manager/Building/getVehicleTypeList/getVehicleTypeListSaga";
import { watchUpdateFloor } from "./manager/Building/updateFloor/updateFloorSaga";
import { watchUpdateFloorStatus } from "./manager/Building/updateFloorStatus/updateFloorStatusSaga";
import { watchUpdateProfileUser } from "./updateProfileUser/updateProfileUserSaga";
import { watchGetAllVehicle } from "./driver/vehicleManagement/getAllVehicle/getAllVehicleSaga";
import { watchGetAllVehicleType } from "./driver/vehicleManagement/createVehicle/getAllTypeVehicleSaga";
import { watchCreateVehicle } from "./driver/vehicleManagement/createVehicle/createVehicleSaga";
import { watchGetVehicleById } from "./driver/vehicleManagement/getVehicleById/getVehicleByIdSaga";
import { watchUpdateVehicle } from "./driver/vehicleManagement/updateVehicle/updateVehicleSaga";
import { watchDeleteVehicle } from "./driver/vehicleManagement/deleteVehicle/deleteVehicleSaga";
import { watchGetZoneByFloor } from "./manager/Building/zone/getZoneByFloor/getZoneByFloorSaga";
import { watchCreateZone } from "./manager/Building/zone/createZone/createZoneSaga";
import { watchGetSlotByZone } from "./manager/Building/zone/getSlotByZone/getSlotByZoneSaga";
<<<<<<< HEAD
import { watchGetAllStaff } from "./manager/StaffManagement/GetAllStaff/getAllStaffSaga";
import { watchAssignStaff } from "./manager/StaffManagement/AssignStaffToBuilding/assignStaffSaga";
import { watchGetStaffBuildings } from "./manager/StaffManagement/GetStaffBuildings/getStaffBuildingsSaga";
import { watchGetBuildingStaff } from "./manager/StaffManagement/GetBuildingStaff/getBuildingStaffSaga";
import { watchRemoveStaffFromBuilding } from "./manager/StaffManagement/RemoveStaffFromBuilding/removeStaffFromBuildingSaga";
=======
import { watchGetVehicleManage } from "./manager/Vehicle/getVehicleManage/getVehicleManageSaga";
import { watchGetAllDriver } from "./manager/Vehicle/getAllDriver/getAllDriverSaga";
import { watchChangeStatusVehicle } from "./manager/Vehicle/changeStatusVehicle/changeStatusVehicleSaga";
import { watchCreateVehicleType } from "./manager/Vehicle/createVehicleType/createVehicleTypeSaga";
import { watchUpdateVehicleType } from "./manager/Vehicle/updateVehicleType/updateVehicleTypeSaga";
import { watchDeteVehicleType } from "./manager/Vehicle/deleteVehicleType/deleteVehicleTypeSaga";
>>>>>>> 75dfc2097e9c88f934af5307e498d637091d9349
export default function* rootSaga() {
  yield all([
    //login - register
    authSaga(),

    //admin
    watchGetAllUser(),
    watchChangeStatusUser(),
    watchChangeRoleUser(),
    watchGetProfileUser(),
    watchChangePassword(),

    //manager
    watchCreateBuilding(),
    watchGetBuildingList(),
    watchGetBuildingDetail(),
    watchUpdateBuilding(),
    watchUpdateBuildingStatus(),
    watchGetBuildingFloors(),
    watchCreateFloor(),
    watchGetVehicleTypeList(),
    watchUpdateFloor(),
    watchUpdateFloorStatus(),
    watchUpdateProfileUser(),
    watchGetZoneByFloor(),
    watchCreateZone(),
    watchGetSlotByZone(),
<<<<<<< HEAD
    watchGetAllStaff(),
    watchAssignStaff(),
    watchGetStaffBuildings(),
    watchGetBuildingStaff(),
    watchRemoveStaffFromBuilding(),
=======
    watchGetVehicleManage(),
    watchGetAllDriver(),
    watchChangeStatusVehicle(),
    watchCreateVehicleType(),
    watchUpdateVehicleType(),
    watchDeteVehicleType(),
>>>>>>> 75dfc2097e9c88f934af5307e498d637091d9349
    //driver
    watchGetAllVehicle(),
    watchGetVehicleById(),
    watchGetAllVehicleType(),
    watchCreateVehicle(),
    watchUpdateVehicle(),
    watchDeleteVehicle(),
  ]);
}
