import { call, put, takeLatest } from "redux-saga/effects";
import { getPricingPolicyByIdApi } from "../../../../service/manager/pricingPolicyApi";
import { extractApiData } from "../../../../utils/apiResponseUtils";
import {
  getPricingPolicyByIdFail,
  getPricingPolicyByIdRequest,
  getPricingPolicyByIdSuccess,
} from "./getPricingPolicyByIdSlice";
import { toast } from "react-toastify";

function* getPricingPolicyByIdSaga(action) {
  try {
    const response = yield call(getPricingPolicyByIdApi, action.payload);
    const policy = extractApiData(response);
    yield put(getPricingPolicyByIdSuccess(policy));
  } catch (error) {
    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message || error.message || "Failed to fetch pricing policy";
    yield put(getPricingPolicyByIdFail(errorMessage));
    toast.error(errorMessage);
  }
}

export function* watchGetPricingPolicyById() {
  yield takeLatest(getPricingPolicyByIdRequest.type, getPricingPolicyByIdSaga);
}
