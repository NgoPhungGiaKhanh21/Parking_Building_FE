import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import { CheckCircle2, LogOut } from "lucide-react";
import { toast } from "react-toastify";

import CommonBreadcrumb from "../../../components/Commandbreadcrumb/Commandbreadcrumb";
import { getAllPaymentsRequest } from "../../../redux/staff/payment/getAllPayments/getAllPaymentsSlice";
import {
  getSessionByPlateNumberRequest,
} from "../../../redux/staff/guest_parking/getSessionByPlateNumber/getSessionByPlateNumberSlice";
import {
  GUEST_EXIT_PAID_KEY,
  GUEST_EXIT_PLATE_KEY,
  GUEST_PAYMENT_PENDING_KEY,
} from "../../../utils/guestExitUtils";

const GuestPaymentSuccess = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    sessionStorage.setItem(GUEST_EXIT_PAID_KEY, "true");
    sessionStorage.removeItem(GUEST_PAYMENT_PENDING_KEY);
    dispatch(getAllPaymentsRequest());

    const plate = sessionStorage.getItem(GUEST_EXIT_PLATE_KEY);
    if (plate) {
      dispatch(getSessionByPlateNumberRequest({ plateNumber: plate }));
    }

    toast.success("Thanh toán PayOS thành công!");
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-[#f0f4ff] p-4 md:p-8">
      <div className="mb-6 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
        <CommonBreadcrumb role="Staff" page="vehicle-exit" subPage="guest-payment" />
      </div>

      <div className="mx-auto max-w-lg rounded-2xl border border-emerald-100 bg-white p-8 shadow-sm text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 size={36} />
        </div>

        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Payment Successful
        </h1>
        <p className="text-slate-500 mb-8">
          PayOS đã xử lý thanh toán. Tiếp tục checkout xe khách vãng lai.
        </p>

        <Button
          type="primary"
          size="large"
          icon={<LogOut size={16} />}
          onClick={() => navigate("/staff/vehicle-exit?checkout=1")}
        >
          Continue to Check Out
        </Button>
      </div>
    </div>
  );
};

export default GuestPaymentSuccess;
