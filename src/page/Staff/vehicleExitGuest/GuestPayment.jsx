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
  UserRound,
} from "lucide-react";

import CommonBreadcrumb from "../../../components/Commandbreadcrumb/Commandbreadcrumb";
import {
  initiatePaymentRequest,
  resetInitiatePayment,
} from "../../../redux/driver/payment/initiatePayment/initiatePaymentSlice";
import {
  getSessionByPlateNumberRequest,
} from "../../../redux/staff/guest_parking/getSessionByPlateNumber/getSessionByPlateNumberSlice";
import {
  buildGuestPaymentPayload,
  GUEST_EXIT_PLATE_KEY,
  GUEST_PAYMENT_PENDING_KEY,
  resolveGuestSessionAmount,
  isGuestSessionPaid,
} from "../../../utils/guestExitUtils";
import { getAllPaymentsRequest } from "../../../redux/staff/payment/getAllPayments/getAllPaymentsSlice";
import { resolveImageUrl } from "../../../utils/reservationSessionUtils";

const GuestPayment = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const { getSessionByPlateNumber, loading: sessionLoading } = useSelector(
    (state) => state.getSessionByPlateNumber,
  );
  const { loading: paymentLoading } = useSelector(
    (state) => state.initiatePayment,
  );
  const { payments } = useSelector((state) => state.getAllPayments);

  const session = getSessionByPlateNumber;
  const amount = resolveGuestSessionAmount(session);
  const isPaid = isGuestSessionPaid(session, payments);

  const guestLabel = useMemo(() => {
    if (session?.guestName) return session.guestName;
    if (session?.guestPhone) return session.guestPhone;
    return "Guest (Walk-in)";
  }, [session?.guestName, session?.guestPhone]);

  const formDefaults = useMemo(
    () => ({
      sessionId: session?.sessionId ?? "",
      paymentMethod: "PAYOS",
      amount,
      guestLabel,
      note: "",
    }),
    [session?.sessionId, amount, guestLabel],
  );

  useEffect(() => {
    dispatch(getAllPaymentsRequest());
    const plate = sessionStorage.getItem(GUEST_EXIT_PLATE_KEY);
    if (!session && plate) {
      dispatch(getSessionByPlateNumberRequest({ plateNumber: plate }));
    }
    return () => dispatch(resetInitiatePayment());
  }, [dispatch, session]);

  useEffect(() => {
    if (session) {
      form.setFieldsValue(formDefaults);
    }
  }, [form, formDefaults, session]);

  const handleSubmit = (values) => {
    if (!session) return;
    sessionStorage.setItem(GUEST_PAYMENT_PENDING_KEY, "true");
    if (session.vehiclePlate) {
      sessionStorage.setItem(GUEST_EXIT_PLATE_KEY, session.vehiclePlate);
    }
    dispatch(
      initiatePaymentRequest(
        buildGuestPaymentPayload(session, values.note, values.amount),
      ),
    );
  };

  if (sessionLoading && !session) {
    return (
      <div className="min-h-screen bg-[#f0f4ff] flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!sessionLoading && !session) {
    return (
      <div className="min-h-screen bg-[#f0f4ff] p-4 md:p-8">
        <div className="mb-6 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
          <CommonBreadcrumb role="Staff" page="vehicle-exit" subPage="guest-payment" />
        </div>
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-20">
          <Empty description="No guest session found. Search by plate first.">
            <Button type="primary" onClick={() => navigate("/staff/vehicle-exit")}>
              Back to Guest Exit
            </Button>
          </Empty>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4ff] p-4 md:p-8">
      <div className="mb-6 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
        <CommonBreadcrumb role="Staff" page="vehicle-exit" subPage="guest-payment" />
        <div className="mt-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-200 bg-violet-50 text-violet-600">
              <CreditCard size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">
                Guest Payment
              </h1>
              <p className="mt-1 font-medium text-slate-500">
                Pay parking fee for walk-in guest via PayOS.
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
          </div>

          {session.checkinImageUrl && (
            <img
              src={resolveImageUrl(session.checkinImageUrl)}
              alt="Check-in"
              className="w-full h-40 object-contain rounded-xl border border-slate-200 bg-slate-50 mb-4"
            />
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] font-bold uppercase text-slate-400 mb-0.5 flex items-center gap-1">
                <Car size={10} /> Plate
              </p>
              <p className="text-sm font-bold font-mono text-slate-700">
                {session.vehiclePlate}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] font-bold uppercase text-slate-400 mb-0.5 flex items-center gap-1">
                <Ticket size={10} /> Ticket
              </p>
              <p className="text-sm font-bold font-mono text-emerald-700">
                {session.ticketCode}
              </p>
            </div>
            <div className="rounded-xl bg-blue-50 border border-blue-100 p-3">
              <p className="text-[10px] font-bold uppercase text-blue-400 mb-0.5 flex items-center gap-1">
                <ParkingCircle size={10} /> Slot
              </p>
              <p className="text-sm font-bold text-blue-700">{session.slotName}</p>
              <p className="text-xs text-blue-500">
                {[session.zoneName, session.floorName].filter(Boolean).join(" · ")}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] font-bold uppercase text-slate-400 mb-0.5 flex items-center gap-1">
                <Building2 size={10} /> Building
              </p>
              <p className="text-sm font-bold text-slate-700">
                {session.buildingName}
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
            >
              <Button
                type="primary"
                onClick={() => navigate("/staff/vehicle-exit?checkout=1")}
              >
                Proceed to Check Out
              </Button>
            </Empty>
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

              <Form.Item name="guestLabel" label="guest">
                <Input
                  readOnly
                  prefix={<UserRound size={14} className="text-slate-400" />}
                  className="!bg-slate-50 !text-slate-700"
                />
              </Form.Item>

              <Form.Item name="note" label="note">
                <Input placeholder="Guest walk-in payment" />
              </Form.Item>

              <div className="flex gap-3">
                <Button onClick={() => navigate("/staff/vehicle-exit")} block>
                  Back
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={paymentLoading}
                  disabled={amount <= 0 || !session.sessionId}
                  block
                  size="large"
                  className="!h-12 !font-bold"
                >
                  Pay {amount.toLocaleString("vi-VN")}đ via PayOS
                </Button>
              </div>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuestPayment;
