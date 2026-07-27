import { call, put, takeEvery, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import {
  createBuildingRuleApi,
  deleteBuildingRuleApi,
  getBuildingRulesApi,
  updateBuildingRuleApi,
} from "../../../../service/manager/buildingApi";
import {
  createBuildingRuleFail,
  createBuildingRuleRequest,
  createBuildingRuleSuccess,
  deleteBuildingRuleFail,
  deleteBuildingRuleRequest,
  deleteBuildingRuleSuccess,
  getBuildingRulesFail,
  getBuildingRulesRequest,
  getBuildingRulesSuccess,
  updateBuildingRuleFail,
  updateBuildingRuleRequest,
  updateBuildingRuleSuccess,
} from "./buildingRulesSlice";

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || error.message || fallback;

const getRules = (response) => {
  const data = response?.data?.data ?? response?.data ?? [];
  return Array.isArray(data) ? data : data?.content ?? data?.items ?? [];
};

function* handleGetBuildingRules(action) {
  const buildingId = action.payload;
  try {
    const response = yield call(getBuildingRulesApi, buildingId);
    yield put(
      getBuildingRulesSuccess({
        buildingId,
        rules: getRules(response),
      }),
    );
  } catch (error) {
    const message = getErrorMessage(error, "Failed to load building rules");
    yield put(getBuildingRulesFail({ buildingId, message }));
  }
}

function* handleCreateBuildingRule(action) {
  try {
    yield call(createBuildingRuleApi, action.payload);
    yield put(createBuildingRuleSuccess());
    yield put(getBuildingRulesRequest(action.payload.buildingId));
    toast.success("Building rule created successfully");
  } catch (error) {
    const message = getErrorMessage(error, "Failed to create building rule");
    yield put(createBuildingRuleFail(message));
    toast.error(message);
  }
}

function* handleUpdateBuildingRule(action) {
  try {
    yield call(updateBuildingRuleApi, action.payload);
    yield put(updateBuildingRuleSuccess());
    yield put(getBuildingRulesRequest(action.payload.buildingId));
    toast.success("Building rule updated successfully");
  } catch (error) {
    const message = getErrorMessage(error, "Failed to update building rule");
    yield put(updateBuildingRuleFail(message));
    toast.error(message);
  }
}

function* handleDeleteBuildingRule(action) {
  try {
    yield call(deleteBuildingRuleApi, action.payload);
    yield put(deleteBuildingRuleSuccess());
    yield put(getBuildingRulesRequest(action.payload.buildingId));
    toast.success("Building rule deleted successfully");
  } catch (error) {
    const message = getErrorMessage(error, "Failed to delete building rule");
    yield put(deleteBuildingRuleFail(message));
    toast.error(message);
  }
}

export function* watchBuildingRules() {
  yield takeEvery(getBuildingRulesRequest.type, handleGetBuildingRules);
  yield takeLatest(createBuildingRuleRequest.type, handleCreateBuildingRule);
  yield takeLatest(updateBuildingRuleRequest.type, handleUpdateBuildingRule);
  yield takeLatest(deleteBuildingRuleRequest.type, handleDeleteBuildingRule);
}
