import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import { XCircle } from "lucide-react";

import CommonBreadcrumb from "../../../components/Commandbreadcrumb/Commandbreadcrumb";
import { GUEST_PAYMENT_PENDING_KEY } from "../../../utils/guestExitUtils";

const GuestPaymentCancel = () => {
  const navigate = useNavigate();

  useEffect(() => {
    sessionStorage.removeItem(GUEST_PAYMENT_PENDING_KEY);
  }, []);

  return (
    <div className="min-h-screen bg-[#f0f4ff] p-4 md:p-8">
      <div className="mb-6 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
        <CommonBreadcrumb role="Staff" page="vehicle-exit" subPage="guest-payment" />
      </div>

      <div className="mx-auto max-w-lg rounded-2xl border border-red-100 bg-white p-8 shadow-sm text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
          <XCircle size={36} />
        </div>

        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Payment Cancelled
        </h1>
        <p className="text-slate-500 mb-8">
          Thanh toán PayOS đã bị hủy hoặc thất bại. Bạn có thể thử lại.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={() => navigate("/staff/vehicle-exit")}>
            Back to Guest Exit
          </Button>
          <Button
            type="primary"
            onClick={() => navigate("/staff/vehicle-exit/payment")}
          >
            Retry Payment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GuestPaymentCancel;
