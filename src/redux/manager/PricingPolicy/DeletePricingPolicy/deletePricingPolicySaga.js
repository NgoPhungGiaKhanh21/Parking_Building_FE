import { call, put, takeLatest } from "redux-saga/effects";
import { deletePricingPolicyApi } from "../../../../service/manager/pricingPolicyApi";
import {
  deletePricingPolicyFail,
  deletePricingPolicyRequest,
  deletePricingPolicySuccess,
} from "./deletePricingPolicySlice";
import { getAllPricingPolicyRequest } from "../GetAllPricingPolicy/getAllPricingPolicySlice";
import { toast } from "react-toastify";

function* deletePricingPolicySaga(action) {
  try {
    yield call(deletePricingPolicyApi, action.payload);
    yield put(deletePricingPolicySuccess());
    yield put(getAllPricingPolicyRequest());
    toast.success("Pricing policy deleted successfully!");
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message || error.message || "Failed to delete pricing policy";
    yield put(deletePricingPolicyFail(errorData || errorMessage));
    toast.error(errorMessage);
  }
}

export function* watchDeletePricingPolicy() {
  yield takeLatest(deletePricingPolicyRequest.type, deletePricingPolicySaga);
}
