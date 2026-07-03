import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Form, Input, Button } from "antd";
import { Mail, KeyRound, Lock, ArrowLeft, ShieldCheck } from "lucide-react";
import { forgotPasswordRequest } from "../../../redux/admin/resetPassword/forgotPassword/forgotPasswordSlice";
import { verifyOtpRequest } from "../../../redux/admin/resetPassword/verifyOtp/verifyOtpSlice";
import { resetPasswordRequest } from "../../../redux/admin/resetPassword/reset-Password/resetPasswordSlice";


/**
 * ResetPasswordFlow - component 3 bước được nhúng vào trang Login
 * Props:
 *   onBack: () => void  — callback để quay về form login
 */
const ResetPasswordFlow = ({ onBack }) => {
  const dispatch = useDispatch();

  // step: "email" | "otp" | "newPassword"
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [emailForm] = Form.useForm();
  const [otpForm] = Form.useForm();
  const [pwForm] = Form.useForm();

  const { loading: loadingForgot } = useSelector((s) => s.forgotPassword);
  const { loading: loadingOtp } = useSelector((s) => s.verifyOtp);
  const { loading: loadingReset, success: resetSuccess } = useSelector((s) => s.resetPassword);

  // Tự quay về login sau khi reset thành công
  useEffect(() => {
    if (resetSuccess) {
      setTimeout(() => {
        onBack();
      }, 1500);
    }
  }, [resetSuccess, onBack]);

  // ── BƯỚC 1: Gửi email ────────────────────────────────────────────
  const handleSendEmail = (values) => {
    setEmail(values.email);
    dispatch(
      forgotPasswordRequest({ email: values.email })
    );
    // Chuyển sang bước OTP ngay (saga toast success/error riêng)
    // Nếu muốn chờ saga success mới chuyển, cần thêm middleware; 
    // ở đây ta chuyển sau khi dispatch để UX nhanh hơn.
    setStep("otp");
  };

  // ── BƯỚC 2: Xác nhận OTP ────────────────────────────────────────
  const handleVerifyOtp = (values) => {
    const otpValue = values.otp;
    setOtp(otpValue);
    dispatch(verifyOtpRequest({ email, otp: otpValue }));
    setStep("newPassword");
  };

  // ── BƯỚC 3: Đặt mật khẩu mới ───────────────────────────────────
  const handleResetPassword = (values) => {
    dispatch(
      resetPasswordRequest({
        email,          // email tự động truyền
        otp,            // otp tự động truyền (không hiển thị trên UI)
        newPassword: values.newPassword,
      })
    );
  };

  // ── ANIMATION VARIANT ────────────────────────────────────────────
  const variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  // ── STEP INDICATOR ───────────────────────────────────────────────
  const steps = ["Email", "OTP", "New Password"];
  const stepIndex = { email: 0, otp: 1, newPassword: 2 }[step];

  return (
    <div className="flex flex-col">
      {/* Back button */}
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors w-fit"
      >
        <ArrowLeft size={16} />
        Back to Login
      </button>

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Reset Password</h2>
        <p className="mt-2 text-slate-500 text-sm">
          Follow the steps below to reset your account password.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((label, idx) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                idx < stepIndex
                  ? "bg-blue-600 text-white"
                  : idx === stepIndex
                  ? "bg-blue-600 text-white ring-4 ring-blue-100"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {idx < stepIndex ? "✓" : idx + 1}
            </div>
            <span
              className={`text-xs font-medium ${
                idx === stepIndex ? "text-blue-600" : "text-slate-400"
              }`}
            >
              {label}
            </span>
            {idx < steps.length - 1 && (
              <div
                className={`h-px w-8 ${
                  idx < stepIndex ? "bg-blue-600" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Forms */}
      <AnimatePresence mode="wait">
        {/* BƯỚC 1: Email */}
        {step === "email" && (
          <motion.div key="email" variants={variants} initial="initial" animate="animate" exit="exit">
            <Form form={emailForm} layout="vertical" onFinish={handleSendEmail} requiredMark={false}>
              <Form.Item
                label="Email Address"
                name="email"
                rules={[
                  { required: true, message: "Please enter your email!" },
                  { type: "email", message: "Invalid email format!" },
                ]}
              >
                <Input
                  size="large"
                  prefix={<Mail size={18} className="text-slate-400" />}
                  placeholder="Enter your registered email"
                  className="rounded-xl py-2"
                />
              </Form.Item>

              <Form.Item className="mb-0 mt-6">
                <Button
                  htmlType="submit"
                  loading={loadingForgot}
                  type="primary"
                  size="large"
                  className="h-12 w-full rounded-xl !bg-blue-600 text-base font-semibold hover:!bg-blue-500"
                >
                  Send OTP
                </Button>
              </Form.Item>
            </Form>
          </motion.div>
        )}

        {/* BƯỚC 2: OTP */}
        {step === "otp" && (
          <motion.div key="otp" variants={variants} initial="initial" animate="animate" exit="exit">
            <div className="mb-4 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-700">
              <ShieldCheck size={16} className="inline mr-1.5" />
              An OTP has been sent to <strong>{email}</strong>
            </div>

            <Form form={otpForm} layout="vertical" onFinish={handleVerifyOtp} requiredMark={false}>
              <Form.Item
                label="Enter OTP Code"
                name="otp"
                rules={[
                  { required: true, message: "Please enter the OTP!" },
                  { len: 6, message: "OTP must be 6 digits!" },
                ]}
              >
                <Input
                  size="large"
                  prefix={<KeyRound size={18} className="text-slate-400" />}
                  placeholder="6-digit OTP"
                  maxLength={6}
                  className="rounded-xl py-2 tracking-widest text-center text-lg font-semibold"
                />
              </Form.Item>

              <div className="flex gap-3 mt-6">
                <Button
                  size="large"
                  className="h-12 flex-1 rounded-xl"
                  onClick={() => setStep("email")}
                >
                  Back
                </Button>
                <Button
                  htmlType="submit"
                  loading={loadingOtp}
                  type="primary"
                  size="large"
                  className="h-12 flex-1 rounded-xl !bg-blue-600 text-base font-semibold hover:!bg-blue-500"
                >
                  Verify OTP
                </Button>
              </div>
            </Form>
          </motion.div>
        )}

        {/* BƯỚC 3: New Password */}
        {step === "newPassword" && (
          <motion.div key="newPassword" variants={variants} initial="initial" animate="animate" exit="exit">
            {/* Email hiển thị (read-only) */}
            <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <Mail size={15} className="inline mr-1.5 text-slate-400" />
              Resetting password for: <strong className="text-slate-800">{email}</strong>
            </div>

            <Form form={pwForm} layout="vertical" onFinish={handleResetPassword} requiredMark={false}>
              <Form.Item
                label="New Password"
                name="newPassword"
                rules={[
                  { required: true, message: "Please enter new password!" },
                  { min: 6, message: "Password must be at least 6 characters!" },
                ]}
              >
                <Input.Password
                  size="large"
                  prefix={<Lock size={18} className="text-slate-400" />}
                  placeholder="Enter new password"
                  className="rounded-xl py-2"
                />
              </Form.Item>

              <Form.Item
                label="Confirm Password"
                name="confirmPassword"
                dependencies={["newPassword"]}
                rules={[
                  { required: true, message: "Please confirm your password!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Passwords do not match!"));
                    },
                  }),
                ]}
              >
                <Input.Password
                  size="large"
                  prefix={<Lock size={18} className="text-slate-400" />}
                  placeholder="Re-enter new password"
                  className="rounded-xl py-2"
                />
              </Form.Item>

              <div className="flex gap-3 mt-6">
                <Button
                  size="large"
                  className="h-12 flex-1 rounded-xl"
                  onClick={() => setStep("otp")}
                >
                  Back
                </Button>
                <Button
                  htmlType="submit"
                  loading={loadingReset}
                  type="primary"
                  size="large"
                  className="h-12 flex-1 rounded-xl !bg-blue-600 text-base font-semibold hover:!bg-blue-500"
                >
                  Reset Password
                </Button>
              </div>
            </Form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResetPasswordFlow;
