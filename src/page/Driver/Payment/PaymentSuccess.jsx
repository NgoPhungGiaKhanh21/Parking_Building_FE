import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import { CheckCircle2, ParkingCircle } from "lucide-react";
import { toast } from "react-toastify";

import CommonBreadcrumb from "../../../components/Commandbreadcrumb/Commandbreadcrumb";
import { getCurrentSessionRequest } from "../../../redux/driver/session/currentSession/currentSessionSlice";

const PaymentSuccess = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getCurrentSessionRequest());
    toast.success("Thanh toán PayOS thành công!");
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-[#f0f4ff] p-4 md:p-8">
      <div className="mb-6 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
        <CommonBreadcrumb role="Driver" page="payment" />
      </div>

      <div className="mx-auto max-w-lg rounded-2xl border border-emerald-100 bg-white p-8 shadow-sm text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 size={36} />
        </div>

        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Payment Successful
        </h1>
        <p className="text-slate-500 mb-8">
          PayOS đã xử lý thanh toán. Session sẽ được cập nhật.
        </p>

        <Button
          type="primary"
          size="large"
          icon={<ParkingCircle size={16} />}
          onClick={() => navigate("/driver/current-session")}
        >
          Current Session
        </Button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
