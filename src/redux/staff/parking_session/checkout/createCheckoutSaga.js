import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import { checkOutApi } from "../../../../service/staff/parking_sessionApi";
import { normalizeReservation } from "../../../../utils/reservationSessionUtils";
import {
    createCheckoutRequest,
    createCheckoutSuccess,
    createCheckoutFail,
} from "./createCheckoutSlice";
import { getAllReservationRequest } from "../../reservation/getAllReservation/getAllReservationSlice";

function* handleCreateCheckout(action) {
    try {
        const { ticketCode, paymentMethod, checkoutImage, checkoutImageUrl } = action.payload;
        const response = yield call(checkOutApi, {
            ticketCode: String(ticketCode || "").trim(),
            paymentMethod: String(paymentMethod || "PAYOS").trim(),
            checkoutImage,
            checkoutImageUrl,
        });
        const body = response.data;

        if (body?.success === false) {
            const errorMessage = body.message || "Failed to check out";
            yield put(createCheckoutFail(errorMessage));
            toast.error(errorMessage);
            return;
        }

        const data = normalizeReservation(body?.data ?? body);
        yield put(
            createCheckoutSuccess({
                message: body?.message || "Check-out successful",
                ...data,
            })
        );
        yield put(getAllReservationRequest());
        toast.success(body?.message || "Check-out successful");
    } catch (error) {
        const errorData = error.response?.data;
        const errorMessage =
            errorData?.message || error.message || "Failed to check out";
        yield put(createCheckoutFail(errorMessage));
        toast.error(errorMessage);
    }
}

export function* watchCreateCheckout() {
    yield takeLatest(createCheckoutRequest.type, handleCreateCheckout);
}
