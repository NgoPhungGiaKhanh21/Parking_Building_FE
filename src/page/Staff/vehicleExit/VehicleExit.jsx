import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Alert, Button, Form, Input, Select, Spin, Switch } from "antd";
import { ArrowLeftSquare, LogOut, Ticket } from "lucide-react";

import CommonBreadcrumb from "../../../components/Commandbreadcrumb/Commandbreadcrumb";
import {
    createCheckoutRequest,
    resetCheckout,
} from "../../../redux/staff/parking_session/checkout/createCheckoutSlice";

const PAYMENT_METHODS = [
    { value: "PAYOS", label: "PayOS" },
    { value: "CASH", label: "Cash" },
    { value: "MOMO", label: "MoMo" },
];

const VehicleExit = () => {
    const dispatch = useDispatch();
    const [form] = Form.useForm();

    const { checkoutResult, loading, error } = useSelector(
        (state) => state.createCheckout
    );

    useEffect(() => {
        return () => dispatch(resetCheckout());
    }, [dispatch]);

    const handleSubmit = (values) => {
        dispatch(
            createCheckoutRequest({
                ticketCode: values.ticketCode?.trim(),
                paymentMethod: values.paymentMethod,
                lostTicket: values.lostTicket ?? false,
            })
        );
    };

    const handleReset = () => {
        form.resetFields();
        dispatch(resetCheckout());
    };

    return (
        <div className="min-h-screen bg-[#f0f4ff] p-4 md:p-8">
            <div className="mb-6 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
                <div className="mb-4">
                    <CommonBreadcrumb role="Staff" page="exit" />
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-200 bg-orange-50 text-orange-600">
                        <ArrowLeftSquare size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">
                            Vehicle Exit
                        </h1>
                        <p className="mt-1 font-medium text-slate-500">
                            Staff quét vé checkout — POST /sessions/checkout
                        </p>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-xl">
                <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                        <LogOut size={14} className="text-orange-500" />
                        Check-out
                    </h2>

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        initialValues={{
                            paymentMethod: "PAYOS",
                            lostTicket: false,
                        }}
                    >
                        <Form.Item
                            name="ticketCode"
                            label="ticketCode"
                            rules={[{ required: true, message: "Nhập mã vé" }]}
                        >
                            <Input
                                prefix={<Ticket size={14} className="text-slate-400" />}
                                placeholder="Quét hoặc nhập ticket code..."
                                className="!font-mono !uppercase"
                                autoFocus
                            />
                        </Form.Item>

                        <Form.Item
                            name="paymentMethod"
                            label="paymentMethod"
                            rules={[{ required: true, message: "Chọn payment method" }]}
                        >
                            <Select options={PAYMENT_METHODS} />
                        </Form.Item>

                        <Form.Item
                            name="lostTicket"
                            label="lostTicket"
                            valuePropName="checked"
                        >
                            <Switch checkedChildren="Yes" unCheckedChildren="No" />
                        </Form.Item>

                        <div className="flex gap-3">
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                block
                                size="large"
                                className="!h-12 !font-bold"
                                icon={<LogOut size={16} />}
                            >
                                Check-out
                            </Button>
                            <Button size="large" onClick={handleReset} disabled={loading}>
                                Reset
                            </Button>
                        </div>
                    </Form>
                </div>

                {loading && (
                    <div className="flex justify-center py-8">
                        <Spin size="large" />
                    </div>
                )}

                {error && (
                    <Alert type="error" message={error} className="mt-4" showIcon />
                )}

                {checkoutResult && (
                    <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-6">
                        <Alert
                            type="success"
                            message="Check-out completed"
                            description="Slot đã được giải phóng, reservation COMPLETED."
                            showIcon
                            className="mb-4 !bg-transparent !border-0"
                        />
                        <div className="grid grid-cols-1 gap-2">
                            {Object.entries(checkoutResult).map(([key, value]) => (
                                <div
                                    key={key}
                                    className="flex justify-between gap-4 rounded-xl bg-white px-4 py-2.5 text-sm"
                                >
                                    <span className="font-bold uppercase text-slate-400 text-xs">
                                        {key}
                                    </span>
                                    <span className="font-semibold text-slate-700 text-right break-all">
                                        {String(value ?? "—")}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VehicleExit;
