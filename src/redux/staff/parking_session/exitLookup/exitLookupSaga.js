import { call, put, select, takeLatest } from "redux-saga/effects";
import {
  resolveTicketCodeByPlateApi,
  ticketLookupApi,
} from "../../../../service/staff/parking_sessionApi";
import {
  hasTicketCheckoutSession,
  normalizeTicketLookupResponse,
} from "../../../../utils/plateLookupUtils";
import {
  exitLookupError,
  exitLookupRequest,
  exitLookupSuccess,
} from "./exitLookupSlice";

function* handleExitLookup(action) {
  const epoch = yield select((state) => state.exitLookup.epoch);
  const { plateNumber } = action.payload;

  try {
    const ticketResponse = yield call(resolveTicketCodeByPlateApi, { plateNumber });
    const ticketData = ticketResponse?.data?.data ?? ticketResponse?.data;

    if (ticketData?.found && ticketData?.ticketCode) {
      const lookupResponse = yield call(ticketLookupApi, ticketData.ticketCode);
      const lookup = normalizeTicketLookupResponse(
        lookupResponse?.data?.data ?? lookupResponse?.data,
      );

      if (hasTicketCheckoutSession(lookup)) {
        yield put(exitLookupSuccess({ epoch, lookup }));
        return;
      }
    }

    yield put(exitLookupSuccess({ epoch, lookup: null }));
  } catch (error) {
    if (error.response?.status === 404) {
      yield put(exitLookupSuccess({ epoch, lookup: null }));
      return;
    }

    const errorData = error.response?.data;
    const errorMessage =
      errorData?.message || error.message || "Failed to lookup checkout session";
    yield put(
      exitLookupError({
        epoch,
        error: errorData || errorMessage,
      }),
    );
  }
}

export function* watchExitLookup() {
  yield takeLatest(exitLookupRequest.type, handleExitLookup);
}
