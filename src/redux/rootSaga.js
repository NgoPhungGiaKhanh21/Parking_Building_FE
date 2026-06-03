import { all } from "redux-saga/effects";
import authSaga from "./auth/authSaga";
import { watchGetAllUser } from "./admin/GetAllUser/GetAllUserSaga";
import { watchChangeStatusUser } from "./admin/ChangeStatusUser/ChangeStatusUserSaga";
import { watchChangeRoleUser } from "./admin/changeRoleUser/changeRoleUserSaga";
import { watchGetProfileUser } from "./profileUser/getProfileUserSaga";
import { watchChangePassword } from "./changePassword/changePasswordSaga";
import { watchCreateBuilding } from "./manager/Building/createBuildingSaga";
import { watchGetBuildingList } from "./manager/Building/getBuildingListSaga";
import { watchGetBuildingDetail } from "./manager/Building/getBuildingDetailSaga";
import { watchUpdateBuilding } from "./manager/Building/updateBuildingSaga";
import { watchGetBuildingFloors } from "./manager/Building/getBuildingFloorsSaga";
import { watchCreateFloor } from "./manager/Building/createFloorSaga";
import { watchGetVehicleTypeList } from "./manager/Building/getVehicleTypeListSaga";
import { watchUpdateFloor } from "./manager/Building/updateFloorSaga";
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
import { watchGetVehicleManage } from "./manager/Vehicle/getVehicleManage/getVehicleManageSaga";
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
    watchGetBuildingFloors(),
    watchCreateFloor(),
    watchGetVehicleTypeList(),
    watchUpdateFloor(),
    watchUpdateProfileUser(),
    watchGetZoneByFloor(),
    watchCreateZone(),
    watchGetSlotByZone(),
    watchGetVehicleManage(),
    //driver
    watchGetAllVehicle(),
    watchGetVehicleById(),
    watchGetAllVehicleType(),
    watchCreateVehicle(),
    watchUpdateVehicle(),
    watchDeleteVehicle(),
  ]);
}
