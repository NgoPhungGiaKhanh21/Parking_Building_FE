import { call, put, takeLatest } from "redux-saga/effects";
import { updatePricingPolicyApi } from "../../../../service/manager/pricingPolicyApi";
import {
  updatePricingPolicyFail,
  updatePricingPolicyRequest,
  updatePricingPolicySuccess,
} from "./updatePricingPolicySlice";
import { getAllPricingPolicyRequest } from "../GetAllPricingPolicy/getAllPricingPolicySlice";
import { toast } from "react-toastify";

function* updatePricingPolicySaga(action) {
  try {
    const { id, data } = action.payload;
    yield call(updatePricingPolicyApi, { id, data });
    yield put(updatePricingPolicySuccess());
    yield put(getAllPricingPolicyRequest());
    toast.success("Pricing policy updated successfully!");
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message || error.message || "Failed to update pricing policy";
    yield put(updatePricingPolicyFail(errorData || errorMessage));
    toast.error(errorMessage);
  }
}

export function* watchUpdatePricingPolicy() {
  yield takeLatest(updatePricingPolicyRequest.type, updatePricingPolicySaga);
}
