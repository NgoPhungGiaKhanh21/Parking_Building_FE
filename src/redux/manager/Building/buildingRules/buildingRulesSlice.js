import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  rulesByBuilding: {},
  loadingByBuilding: {},
  mutating: false,
  mutationSuccess: false,
  error: null,
};

const buildingRulesSlice = createSlice({
  name: "buildingRules",
  initialState,
  reducers: {
    getBuildingRulesRequest: (state, action) => {
      state.loadingByBuilding[action.payload] = true;
      state.error = null;
    },
    getBuildingRulesSuccess: (state, action) => {
      const { buildingId, rules } = action.payload;
      state.loadingByBuilding[buildingId] = false;
      state.rulesByBuilding[buildingId] = rules;
    },
    getBuildingRulesFail: (state, action) => {
      const { buildingId, message } = action.payload;
      state.loadingByBuilding[buildingId] = false;
      state.error = message;
    },

    createBuildingRuleRequest: (state) => {
      state.mutating = true;
      state.mutationSuccess = false;
      state.error = null;
    },
    createBuildingRuleSuccess: (state) => {
      state.mutating = false;
      state.mutationSuccess = true;
    },
    createBuildingRuleFail: (state, action) => {
      state.mutating = false;
      state.error = action.payload;
    },

    updateBuildingRuleRequest: (state) => {
      state.mutating = true;
      state.mutationSuccess = false;
      state.error = null;
    },
    updateBuildingRuleSuccess: (state) => {
      state.mutating = false;
      state.mutationSuccess = true;
    },
    updateBuildingRuleFail: (state, action) => {
      state.mutating = false;
      state.error = action.payload;
    },

    deleteBuildingRuleRequest: (state) => {
      state.mutating = true;
      state.mutationSuccess = false;
      state.error = null;
    },
    deleteBuildingRuleSuccess: (state) => {
      state.mutating = false;
      state.mutationSuccess = true;
    },
    deleteBuildingRuleFail: (state, action) => {
      state.mutating = false;
      state.error = action.payload;
    },

    resetBuildingRuleMutation: (state) => {
      state.mutationSuccess = false;
      state.error = null;
    },
  },
});

export const {
  getBuildingRulesRequest,
  getBuildingRulesSuccess,
  getBuildingRulesFail,
  createBuildingRuleRequest,
  createBuildingRuleSuccess,
  createBuildingRuleFail,
  updateBuildingRuleRequest,
  updateBuildingRuleSuccess,
  updateBuildingRuleFail,
  deleteBuildingRuleRequest,
  deleteBuildingRuleSuccess,
  deleteBuildingRuleFail,
  resetBuildingRuleMutation,
} = buildingRulesSlice.actions;

export default buildingRulesSlice.reducer;
