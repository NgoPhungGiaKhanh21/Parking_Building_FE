import { combineReducers } from "@reduxjs/toolkit";

import authReducer from "./auth/authSlice";
import getAllUserReducer from "./admin/GetAllUser/getAllUserSlice";
import changeStatusUserReducer from "./admin/ChangeStatusUser/ChangeStatusUserSlice";
import changeRoleUserReducer from "./admin/changeRoleUser/changeRoleUserSlice";
import getAdminDashboardStatsReducer from "./admin/dashboardStats/getAdminDashboardStatsSlice";
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
import getAllSlotDriverReducer from "./driver/reservationManagement/getAllSlotDriver/getAllSlotDriverSlice";
import getAvailableBuildingsReducer from "./driver/reservationManagement/getAvailableBuildings/getAvailableBuildingsSlice";
import getBuildingFloorsDriverReducer from "./driver/reservationManagement/getBuildingFloors/getBuildingFloorsSlice";
import getZoneSlotsReducer from "./driver/reservationManagement/getZoneSlots/getZoneSlotsSlice";
import createReservationReducer from "./driver/reservationManagement/createReservations/createReservationsSlice";
import getMyReservationsReducer from "./driver/reservationManagement/getMyReservations/getMyReservationsSlice";
import updateZoneStatusReducer from "./manager/Building/zone/updateZoneStatus/updateZoneStatusSlice";
import getAllPricingPolicyReducer from "./manager/PricingPolicy/GetAllPricingPolicy/getAllPricingPolicySlice";
import getPricingPolicyByIdReducer from "./manager/PricingPolicy/GetPricingPolicyById/getPricingPolicyByIdSlice";
import createPricingPolicyReducer from "./manager/PricingPolicy/CreatePricingPolicy/createPricingPolicySlice";
import updatePricingPolicyReducer from "./manager/PricingPolicy/UpdatePricingPolicy/updatePricingPolicySlice";
import deletePricingPolicyReducer from "./manager/PricingPolicy/DeletePricingPolicy/deletePricingPolicySlice";
import getAllReservationReducer from "./staff/reservation/getAllReservation/getAllReservationSlice";
import approvedReservationReducer from "./staff/reservation/approvedReservation/approvedReservationSlice";
import createCheckinReducer from "./staff/parking_session/checkin/createCheckinSlice";
// import createCheckoutReducer from "./staff/parking_session/checkout/createCheckoutSlice";
import updateZoneReducer from "./manager/Building/zone/updateZone/updateZoneSlice";
import getCurrentSessionReducer from "./driver/session/currentSession/currentSessionSlice";
import initiatePaymentReducer from "./driver/payment/initiatePayment/initiatePaymentSlice";
import getAllPaymentsReducer from "./staff/payment/getAllPayments/getAllPaymentsSlice";
import confirmPaymentByStaffReducer from "./staff/payment/confirmPaymentByStaff/confirmPaymentByStaffSlice";
import getDriverPaymentsReducer from "./driver/payment/getDriverPayments/getDriverPaymentsSlice";
import getAllVehicleManagerReducer from "./manager/Vehicle/getAllVehicle/getAllVehicleSlice";
import getOccupiedSlotReducer from "./manager/Building/zone/getOccupiedSlot/getOccupiedSlotSlice";
import getRevenueReducer from "./manager/Revenue/getRevenueSlice";
import getSessionByPlateNumberReducer from "./staff/guest_parking/getSessionByPlateNumber/getSessionByPlateNumberSlice";
import checkInGuestReducer from "./staff/guest_parking/checkin_guest/checkInGuestSlice";
import forgotPasswordReducer from "./admin/resetPassword/forgotPassword/forgotPasswordSlice";
import verifyOtpReducer from "./admin/resetPassword/verifyOtp/verifyOtpSlice";
import resetPasswordReducer from "./admin/resetPassword/reset-Password/resetPasswordSlice";
import ocrPlateReducer from "./staff/ocrPlate/ocrPlateSlice";
import getStaffBuildingReducer from "./staff/guest_parking/getStaffBuilding/getStaffBuildingSlice";
import unifiedCheckinReducer from './staff/parking_session/checkin/unifiedCheckinSlice';
import unifiedCheckoutReducer from './staff/parking_session/checkout/unifiedCheckoutSlice';
import cancelReservationsReducer from "./driver/reservationManagement/cancelReservations/cancelReservationsSlice";
import guestCheckoutOcrReducer from "./staff/guest_parking/checkout_guest_ocr/guestCheckoutOcrSlice";
import incidentReducer from "./incident/incidentSlice";

const rootReducer = combineReducers({
  //login - register
  auth: authReducer,

  //admin
  getAllUser: getAllUserReducer,
  changeStatusUser: changeStatusUserReducer,
  changeRoleUser: changeRoleUserReducer,
  getAdminDashboardStats: getAdminDashboardStatsReducer,
  getProfileUser: getProfileUserReducer,
  changePassword: changePasswordReducer,
  forgotPassword: forgotPasswordReducer,
  verifyOtp: verifyOtpReducer,
  resetPassword: resetPasswordReducer,
  incident: incidentReducer,

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
  updateZoneStatus: updateZoneStatusReducer,
  getSlotByZone: getSlotByZoneReducer,
  getOccupiedSlot: getOccupiedSlotReducer,
  getAllStaff: getStaffListReducer,
  postStaffToBuilding: postStaffToBuildingReducer,
  getStaffBuildings: getStaffBuildingsReducer,
  getBuildingStaff: getBuildingStaffReducer,
  removeStaffFromBuilding: removeStaffFromBuildingReducer,
  getVehicleManage: getVehicleManageReducer,
  getAllVehicleManager: getAllVehicleManagerReducer,
  getAllDriver: getAllDriverReducer,
  changeStatusVehicle: changeStatusVehicleReducer,
  createVehicleType: createVehicleTypeReducer,
  updateVehicleType: updateVehicleTypeReducer,
  deleteVehicleType: deleteVehicleTypeReducer,
  getAllPricingPolicy: getAllPricingPolicyReducer,
  getPricingPolicyById: getPricingPolicyByIdReducer,
  createPricingPolicy: createPricingPolicyReducer,
  updatePricingPolicy: updatePricingPolicyReducer,
  deletePricingPolicy: deletePricingPolicyReducer,
  updateZone: updateZoneReducer,
  getRevenue: getRevenueReducer,

  //staff
  getAllReservation: getAllReservationReducer,
  approvedReservation: approvedReservationReducer,
  createCheckin: createCheckinReducer,
  // createCheckout: createCheckoutReducer,
  getAllPayments: getAllPaymentsReducer,
  confirmPaymentByStaff: confirmPaymentByStaffReducer,
  getSessionByPlateNumber: getSessionByPlateNumberReducer,
  checkInGuest: checkInGuestReducer,
  ocrPlate: ocrPlateReducer,
  getStaffBuilding: getStaffBuildingReducer,
  unifiedCheckin: unifiedCheckinReducer,
  unifiedCheckout: unifiedCheckoutReducer,
  cancelReservations: cancelReservationsReducer,
  guestCheckoutOcr: guestCheckoutOcrReducer,

  //driver
  getAllVehicle: getAllVehicleReducer,
  getVehicleById: getVehicleByIdReducer,
  getAllVehicleType: getAllVehicleTypeReducer,
  createVehicle: createVehicleReducer,
  updateVehicle: updateVehicleReducer,
  deleteVehicle: deleteVehicleReducer,
  getAllSlotDriver: getAllSlotDriverReducer,
  getAvailableBuildings: getAvailableBuildingsReducer,
  getBuildingFloorsDriver: getBuildingFloorsDriverReducer,
  getZoneSlots: getZoneSlotsReducer,
  createReservation: createReservationReducer,
  getMyReservations: getMyReservationsReducer,
  getCurrentSession: getCurrentSessionReducer,
  initiatePayment: initiatePaymentReducer,
  getDriverPayments: getDriverPaymentsReducer,
});

export default rootReducer;
