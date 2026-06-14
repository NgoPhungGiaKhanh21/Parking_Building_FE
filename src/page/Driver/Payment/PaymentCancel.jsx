import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import { XCircle, ParkingCircle } from "lucide-react";

import CommonBreadcrumb from "../../../components/Commandbreadcrumb/Commandbreadcrumb";

const PaymentCancel = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#f0f4ff] p-4 md:p-8">
            <div className="mb-6 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
                <CommonBreadcrumb role="Driver" page="payment" />
            </div>

            <div className="mx-auto max-w-lg rounded-2xl border border-amber-100 bg-white p-8 shadow-sm text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                    <XCircle size={36} />
                </div>

                <h1 className="text-2xl font-bold text-slate-800 mb-2">
                    Payment Cancelled
                </h1>
                <p className="text-slate-500 mb-8">
                    Bạn đã hủy thanh toán PayOS. Có thể thử lại bất cứ lúc nào.
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

export default PaymentCancel;
