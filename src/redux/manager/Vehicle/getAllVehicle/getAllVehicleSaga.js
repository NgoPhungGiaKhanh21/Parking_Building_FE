import { call, put, takeLatest } from 'redux-saga/effects';
import { getAllVehicleApi } from '../../../../service/manager/vehicleApi';
import { getAllVehicleRequest, getAllVehicleSuccess, getAllVehicleFailure } from './getAllVehicleSlice';
import { toast } from 'react-toastify';

function* handleGetAllVehicleManager(action) {
    try {
        const response = yield call(getAllVehicleApi, action.payload);
        const data = response.data.data;
        yield put(getAllVehicleSuccess(data));
    } catch(error) {
        const errorData = error.response?.data;
        const errorMessage =
            errorData?.message || error.message || "Failed to fetch vehicle list";
        toast.error(errorMessage);
        yield put(getAllVehicleFailure(errorMessage));
    }
}

export function* watchGetAllVehicleManager() {
    yield takeLatest(getAllVehicleRequest.type, handleGetAllVehicleManager);
}


