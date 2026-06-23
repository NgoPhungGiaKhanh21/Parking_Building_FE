import { call, put, takeLatest } from "redux-saga/effects";
import { getRevenueFail, getRevenueRequest, getRevenueSuccess } from "./getRevenueSlice";
import { getRevenueApi } from "../../../service/manager/revenue";
import { toast } from "react-toastify";

function* handleGetRevenue(action) {
    try {
        const response = yield call(getRevenueApi, action.payload);
        const data = response.data.data;
        yield put(getRevenueSuccess(data));
    } catch(error){
        const errorData = error.response?.data;
        yield put(getRevenueFail(errorData));
        toast.error(errorData?.message || "Failed to get revenue");
    }
}

export function* watchGetRevenue() {
    yield takeLatest(getRevenueRequest.type, handleGetRevenue);
}

