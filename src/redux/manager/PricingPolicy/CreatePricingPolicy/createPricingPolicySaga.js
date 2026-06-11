import { call, put, takeLatest } from "redux-saga/effects";
import { createPricingPolicyApi } from "../../../../service/manager/pricingPolicyApi";
import {
  createPricingPolicyFail,
  createPricingPolicyRequest,
  createPricingPolicySuccess,
} from "./createPricingPolicySlice";
import { getAllPricingPolicyRequest } from "../GetAllPricingPolicy/getAllPricingPolicySlice";
import { toast } from "react-toastify";

function* createPricingPolicySaga(action) {
  try {
    yield call(createPricingPolicyApi, action.payload);
    yield put(createPricingPolicySuccess());
    yield put(getAllPricingPolicyRequest());
    toast.success("Pricing policy created successfully!");
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message || error.message || "Failed to create pricing policy";
    yield put(createPricingPolicyFail(errorData || errorMessage));
    toast.error(errorMessage);
  }
}

export function* watchCreatePricingPolicy() {
  yield takeLatest(createPricingPolicyRequest.type, createPricingPolicySaga);
}
