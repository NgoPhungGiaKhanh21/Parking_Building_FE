import { all } from "redux-saga/effects";
import authSaga from "./auth/authSaga";
import { watchGetAllUser } from "./admin/GetAllUser/GetAllUserSaga";
import { watchChangeStatusUser } from "./admin/ChangeStatusUser/ChangeStatusUserSaga";
import { watchChangeRoleUser } from "./admin/changeRoleUser/changeRoleUserSaga";
import { watchGetAdminDashboardStats } from "./admin/dashboardStats/getAdminDashboardStatsSaga";
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
import { watchGetAllStaff } from "./manager/StaffManagement/GetAllStaff/getAllStaffSaga";
import { watchAssignStaff } from "./manager/StaffManagement/AssignStaffToBuilding/assignStaffSaga";
import { watchGetStaffBuildings } from "./manager/StaffManagement/GetStaffBuildings/getStaffBuildingsSaga";
import { watchGetBuildingStaff } from "./manager/StaffManagement/GetBuildingStaff/getBuildingStaffSaga";
import { watchRemoveStaffFromBuilding } from "./manager/StaffManagement/RemoveStaffFromBuilding/removeStaffFromBuildingSaga";
import { watchGetVehicleManage } from "./manager/Vehicle/getVehicleManage/getVehicleManageSaga";
import { watchGetAllDriver } from "./manager/Vehicle/getAllDriver/getAllDriverSaga";
import { watchChangeStatusVehicle } from "./manager/Vehicle/changeStatusVehicle/changeStatusVehicleSaga";
import { watchCreateVehicleType } from "./manager/Vehicle/createVehicleType/createVehicleTypeSaga";
import { watchUpdateVehicleType } from "./manager/Vehicle/updateVehicleType/updateVehicleTypeSaga";
import { watchDeteVehicleType } from "./manager/Vehicle/deleteVehicleType/deleteVehicleTypeSaga";
import { watchGetAllSlotDriver } from "./driver/reservationManagement/getAllSlotDriver/getAllSlotDriverSaga";
import { watchGetAvailableBuildings } from "./driver/reservationManagement/getAvailableBuildings/getAvailableBuildingsSaga";
import { watchGetBuildingFloors as watchGetBuildingFloorsDriver } from "./driver/reservationManagement/getBuildingFloors/getBuildingFloorsSaga";
import { watchGetZoneSlots } from "./driver/reservationManagement/getZoneSlots/getZoneSlotsSaga";
import { watchCreateReservations } from "./driver/reservationManagement/createReservations/createReservationsSaga";
import { watchGetMyReservations } from "./driver/reservationManagement/getMyReservations/getMyReservationsSaga";
import { watchUpdateZoneStatus } from "./manager/Building/zone/updateZoneStatus/updateZoneStatusSaga";

import { watchGetAllPricingPolicy } from "./manager/PricingPolicy/GetAllPricingPolicy/getAllPricingPolicySaga";
import { watchGetPricingPolicyById } from "./manager/PricingPolicy/GetPricingPolicyById/getPricingPolicyByIdSaga";
import { watchCreatePricingPolicy } from "./manager/PricingPolicy/CreatePricingPolicy/createPricingPolicySaga";
import { watchUpdatePricingPolicy } from "./manager/PricingPolicy/UpdatePricingPolicy/updatePricingPolicySaga";
import { watchDeletePricingPolicy } from "./manager/PricingPolicy/DeletePricingPolicy/deletePricingPolicySaga";
import { watchGetAllReservation } from "./staff/reservation/getAllReservation/getAllReservationSaga";
import { watchApproveReservation } from "./staff/reservation/approvedReservation/approvedReservationSaga";
import { watchCreateCheckin } from "./staff/parking_session/checkin/createCheckinSaga";
// import { watchCreateCheckout } from "./staff/parking_session/checkout/createCheckoutSaga";
import { watchUpdateZone } from "./manager/Building/zone/updateZone/updateZoneSaga";
import { watchGetCurrentSession } from "./driver/session/currentSession/currentSessionSaga";
import { watchInitiatePayment } from "./driver/payment/initiatePayment/initiatePaymentSaga";
import { watchGetAllPayments } from "./staff/payment/getAllPayments/getAllPaymentsSaga";
import { watchConfirmPaymentByStaff } from "./staff/payment/confirmPaymentByStaff/confirmPaymentByStaffSaga";
import { watchGetDriverPayments } from "./driver/payment/getDriverPayments/getDriverPaymentsSaga";
import { watchGetAllVehicleManager } from "./manager/Vehicle/getAllVehicle/getAllVehicleSaga";
import { watchGetOccupiedSlot } from "./manager/Building/zone/getOccupiedSlot/getOccupiedSlotSaga";
import { watchGetRevenue } from "./manager/Revenue/getRevenueSaga";
import { watchGetSessionByPlateNumber } from "./staff/guest_parking/getSessionByPlateNumber/getSessionByPlateNumberSaga";
import { watchCheckInGuest } from "./staff/guest_parking/checkin_guest/checkInGuestSaga";
import {watchForgotPassword} from "./admin/resetPassword/forgotPassword/forgotPasswordSaga";
import {watchVerifyOtp} from "./admin/resetPassword/verifyOtp/verifyOtpSaga";
import {watchResetPassword} from "./admin/resetPassword/reset-Password/resetPasswordSaga";
import {watchOCRPlate} from "./staff/ocrPlate/ocrPlateSaga";
import {watchGetStaffBuilding} from "./staff/guest_parking/getStaffBuilding/getStaffBuildingSaga";
import {watchGuestCheckoutOcr} from "./staff/guest_parking/checkout_guest_ocr/guestCheckoutOcrSaga";
import {watchUnifiedCheckin} from "./staff/parking_session/checkin/unifiedCheckinSaga";
import {watchUnifiedCheckout} from "./staff/parking_session/checkout/unifiedCheckoutSaga";
import {watchCancelReservations} from "./driver/reservationManagement/cancelReservations/cancelReservationsSaga";
export default function* rootSaga() {
  yield all([
    //login - register
    authSaga(),

    //admin
    watchGetAllUser(),
    watchChangeStatusUser(),
    watchChangeRoleUser(),
    watchGetAdminDashboardStats(),
    watchGetProfileUser(),
    watchChangePassword(),
    watchForgotPassword(),
    watchVerifyOtp(),
    watchResetPassword(),

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
    watchUpdateZoneStatus(),
    watchGetSlotByZone(),
    watchGetOccupiedSlot(),
    watchGetAllStaff(),
    watchAssignStaff(),
    watchGetStaffBuildings(),
    watchGetBuildingStaff(),
    watchRemoveStaffFromBuilding(),
    watchGetVehicleManage(),
    watchGetAllVehicleManager(),
    watchGetAllDriver(),
    watchChangeStatusVehicle(),
    watchCreateVehicleType(),
    watchUpdateVehicleType(),
    watchDeteVehicleType(),
    watchGetAllPricingPolicy(),
    watchGetPricingPolicyById(),
    watchCreatePricingPolicy(),
    watchUpdatePricingPolicy(),
    watchDeletePricingPolicy(),
    watchUpdateZone(),
    watchGetRevenue(),

    //staff
    watchGetAllReservation(),
    watchApproveReservation(),
    watchCreateCheckin(),
    // watchCreateCheckout(),
    watchGetAllPayments(),
    watchConfirmPaymentByStaff(),
    watchGetSessionByPlateNumber(),
    watchCheckInGuest(),
    watchOCRPlate(),
    watchGetStaffBuilding(),
    watchGuestCheckoutOcr(),
    watchUnifiedCheckin(),
    watchUnifiedCheckout(),
    watchCancelReservations(),
    //driver
    watchGetAllVehicle(),
    watchGetVehicleById(),
    watchGetAllVehicleType(),
    watchCreateVehicle(),
    watchUpdateVehicle(),
    watchDeleteVehicle(),
    watchGetAllSlotDriver(),
    watchGetAvailableBuildings(),
    watchGetBuildingFloorsDriver(),
    watchGetZoneSlots(),
    watchCreateReservations(),
    watchGetMyReservations(),
    watchGetCurrentSession(),
    watchInitiatePayment(),
    watchGetDriverPayments(),
  ]);
}
