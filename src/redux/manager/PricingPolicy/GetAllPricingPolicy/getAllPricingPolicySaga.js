import { call, put, takeLatest } from "redux-saga/effects";
import { getAllPricingPolicyApi } from "../../../../service/manager/pricingPolicyApi";
import { extractApiList } from "../../../../utils/apiResponseUtils";
import {
  getAllPricingPolicyFail,
  getAllPricingPolicyRequest,
  getAllPricingPolicySuccess,
} from "./getAllPricingPolicySlice";
import { toast } from "react-toastify";

function* getAllPricingPolicySaga() {
  try {
    const response = yield call(getAllPricingPolicyApi);
    const policies = extractApiList(response);
    yield put(getAllPricingPolicySuccess(policies));
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message || error.message || "Failed to fetch pricing policies";
    yield put(getAllPricingPolicyFail(errorMessage));
    toast.error(errorMessage);
  }
}

export function* watchGetAllPricingPolicy() {
  yield takeLatest(getAllPricingPolicyRequest.type, getAllPricingPolicySaga);
}
