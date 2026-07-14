import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button, Empty, Form, Input, InputNumber, Spin, Tag } from "antd";
import {
  CreditCard,
  Car,
  ParkingCircle,
  Ticket,
  DollarSign,
  Building2,
} from "lucide-react";

import CommonBreadcrumb from "../../../components/Commandbreadcrumb/Commandbreadcrumb";
import { getCurrentSessionRequest } from "../../../redux/driver/session/currentSession/currentSessionSlice";
import { getProfileUserRequest } from "../../../redux/profileUser/getProfileUserSlice";
import {
  initiatePaymentRequest,
  resetInitiatePayment,
} from "../../../redux/driver/payment/initiatePayment/initiatePaymentSlice";

const getFrontendBaseUrl = () =>
  import.meta.env.VITE_APP_URL || window.location.origin;

/** URL FE — BE redirect browser về đây sau khi xử lý /api/payments/payos/return|cancel */
const getFrontendRedirectUrls = () => {
  const base = getFrontendBaseUrl();
  return {
    frontendReturnUrl: `${base}/payment/success`,
    frontendCancelUrl: `${base}/payment/failed`,
  };
};

/** API trả { sessions: [...] } hoặc 1 session object */
const resolveSessions = (currentSession) => {
  if (!currentSession) return [];
  if (Array.isArray(currentSession.sessions)) return currentSession.sessions;
  if (currentSession.sessionId || currentSession.id) return [currentSession];
  return [];
};

const resolveSessionAmount = (session) =>
  session?.estimatedFee ??
  session?.currentAccumulatedFee ??
  session?.basePrice ??
  0;

const resolveDriverName = (profile) =>
  profile?.fullName ?? profile?.driverName ?? profile?.name ?? "—";

const buildPaymentPayload = (session, profile, note, amount) => {
  return {
    sessionId: session.sessionId ?? session.id,
    ticketCode: session.ticketCode ?? "",
    reservationCode: session.reservationCode ?? "",
    paymentMethod: "PAYOS",
    amount: amount ?? resolveSessionAmount(session),
    driverId: profile?.id ?? profile?.userId ?? "",
    note: note?.trim() || "",
    ...getFrontendRedirectUrls(),
  };
};

const Payment = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const { currentSession, loading: sessionLoading } = useSelector(
    (state) => state.getCurrentSession,
  );
  const { getProfileUser } = useSelector((state) => state.getProfileUser);
  const { loading: paymentLoading } = useSelector(
    (state) => state.initiatePayment,
  );

  const sessions = useMemo(
    () => resolveSessions(currentSession),
    [currentSession],
  );

  const activeSession = useMemo(() => {
    return (
      sessions.find(
        (s) => s.paymentStatus === "UNPAID" || s.paymentStatus === "FAILED",
      ) ??
      sessions[0] ??
      null
    );
  }, [sessions]);

  const sessionId = activeSession?.sessionId ?? activeSession?.id ?? "";
  const driverId = getProfileUser?.id ?? getProfileUser?.userId ?? "";
  const driverName = resolveDriverName(getProfileUser);
  const amount = resolveSessionAmount(activeSession);

  const formDefaults = useMemo(
    () => ({
      sessionId,
      paymentMethod: "PAYOS",
      amount,
      driverName,
      note: "",
    }),
    [sessionId, amount, driverName],
  );

  useEffect(() => {
    dispatch(getCurrentSessionRequest());
    dispatch(getProfileUserRequest());
    return () => dispatch(resetInitiatePayment());
  }, [dispatch]);

  useEffect(() => {
    if (activeSession && getProfileUser) {
      form.setFieldsValue(formDefaults);
    }
  }, [form, formDefaults, activeSession, getProfileUser]);

  const handleSubmit = (values) => {
    if (!activeSession) return;

    const payload = buildPaymentPayload(
      activeSession,
      getProfileUser,
      values.note,
      values.amount,
    );
    dispatch(initiatePaymentRequest(payload));
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-[#f0f4ff] flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!sessionLoading && !activeSession) {
    return (
      <div className="min-h-screen bg-[#f0f4ff] p-4 md:p-8">
        <div className="mb-6 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
          <CommonBreadcrumb role="Driver" page="payment" />
        </div>
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-20">
          <Empty
            description="No active session to pay for"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button
              type="primary"
              onClick={() => navigate("/driver/current-session")}
            >
              Go to Current Session
            </Button>
          </Empty>
        </div>
      </div>
    );
  }

  const isPaid = activeSession.paymentStatus === "PAID";

  return (
    <div className="min-h-screen bg-[#f0f4ff] p-4 md:p-8">
      <div className="mb-6 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <CommonBreadcrumb role="Driver" page="payment" />
        </div>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-200 bg-violet-50 text-violet-600">
              <CreditCard size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">
                Payment
              </h1>
              <p className="mt-1 font-medium text-slate-500">
                Pay for your current parking session via PayOS.
              </p>
            </div>
          </div>
          <Tag
            color={isPaid ? "green" : "gold"}
            className="!text-sm !font-semibold !px-4 !py-1.5"
          >
            {isPaid ? "Paid" : "Unpaid"}
          </Tag>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <DollarSign size={14} className="text-emerald-500" />
            Session Summary
          </h2>

          <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white mb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-200 mb-1">
              Amount Due
            </p>
            <p className="text-4xl font-black">
              {amount.toLocaleString("vi-VN")}đ
            </p>
            {activeSession.currentFeeExplanation && (
              <p className="text-xs text-emerald-200 mt-2">
                {activeSession.currentFeeExplanation}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] font-bold uppercase text-slate-400 mb-0.5 flex items-center gap-1">
                <Car size={10} /> Plate
              </p>
              <p className="text-sm font-bold font-mono text-slate-700">
                {activeSession.vehiclePlate}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] font-bold uppercase text-slate-400 mb-0.5 flex items-center gap-1">
                <Ticket size={10} /> Ticket
              </p>
              <p className="text-sm font-bold font-mono text-emerald-700">
                {activeSession.ticketCode}
              </p>
            </div>
            <div className="rounded-xl bg-blue-50 border border-blue-100 p-3">
              <p className="text-[10px] font-bold uppercase text-blue-400 mb-0.5 flex items-center gap-1">
                <ParkingCircle size={10} /> Slot
              </p>
              <p className="text-sm font-bold text-blue-700">
                {activeSession.slotName}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] font-bold uppercase text-slate-400 mb-0.5 flex items-center gap-1">
                <Building2 size={10} /> Building
              </p>
              <p className="text-sm font-bold text-slate-700">
                {activeSession.buildingName}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <CreditCard size={14} className="text-violet-500" />
            Payment Request
          </h2>

          {isPaid ? (
            <Empty
              description="This session has already been paid."
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={formDefaults}
            >
              <Form.Item name="sessionId" label="sessionId">
                <Input
                  readOnly
                  className="!bg-slate-50 !font-mono !text-slate-600"
                />
              </Form.Item>

              <Form.Item name="paymentMethod" label="paymentMethod">
                <Input
                  readOnly
                  className="!bg-slate-50 !font-mono !text-slate-600"
                />
              </Form.Item>

              <Form.Item name="amount" label="amount">
                <InputNumber
                  readOnly
                  className="!w-full !bg-slate-50"
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/,/g, "")}
                />
              </Form.Item>

              <Form.Item name="driverName" label="driverName">
                <Input readOnly className="!bg-slate-50 !text-slate-700" />
              </Form.Item>

              <Form.Item name="note" label="note">
                <Input placeholder="Test PayOS" />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                loading={paymentLoading}
                disabled={amount <= 0 || !sessionId || !driverId}
                block
                size="large"
                className="!h-12 !font-bold"
              >
                Pay {amount.toLocaleString("vi-VN")}đ via PayOS
              </Button>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payment;
