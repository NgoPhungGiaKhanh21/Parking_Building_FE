import {call, put, takeLatest} from "redux-saga/effects"
import {getCurrentSessionApi} from "../../../../service/driver/sessionApi"
import {getCurrentSessionRequest, getCurrentSessionSuccess, getCurrentSessionFail} from "./currentSessionSlice"

export function* getCurrentSessionSaga(action){
    try {
        const response = yield call(getCurrentSessionApi, action.payload)
        const data = response.data?.data ?? response.data;
        yield put(getCurrentSessionSuccess(data))
    } catch (error) {
        const errorData = error.response?.data;
        const errorMessage =
            errorData?.message || error.message || "Failed to get current session";
        yield put(getCurrentSessionFail(errorMessage))
    }
}

export function* watchGetCurrentSession(){
    yield takeLatest(getCurrentSessionRequest.type, getCurrentSessionSaga)
}

