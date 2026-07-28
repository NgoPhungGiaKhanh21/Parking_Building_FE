import { Spin, Radio } from "antd";
import { Banknote, CreditCard, CheckCircle2, LogOut } from "lucide-react";
import { getCheckModeTheme, CHECK_MODES } from "../../shared/checkModeTheme";

const ExitCheckoutActions = ({
  checkMode,
  normalizedSession,
  isPaid,
  isDriver,
  isDriverWalkIn,
  isCashCheckout,
  isDriverCashAtGate,
  paymentMethod,
  onPaymentMethodChange,
  showCheckout,
  checkoutLoading,
  hasCheckoutImage,
  onGoPayment,
  onConfirmCheckout,
  onStartCheckout,
}) => {
  if (!normalizedSession) return null;

  const theme = getCheckModeTheme(checkMode);
  const guestTheme = getCheckModeTheme(CHECK_MODES.GUEST);

  return (
    <div className="space-y-3">
      {!isPaid && (
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
            Payment Method
          </p>
          {isDriver ? (
            <div className={`rounded-xl border p-3 text-center ${theme.panelBg}`}>
              <p className={`text-sm font-bold mb-1 flex items-center justify-center gap-2 ${theme.accentTextDark}`}>
                <Banknote size={18} /> Cash at Gate
              </p>
              <p className={`text-xs ${theme.accentText}`}>
                {isDriverWalkIn
                  ? "Driver can pay online via the Driver App, or collect cash here at checkout."
                  : "Drivers paying at the gate must use cash. Online payments should be done via the Driver App."}
              </p>
            </div>
          ) : (
            <>
              <Radio.Group
                value={paymentMethod}
                onChange={(event) => onPaymentMethodChange(event.target.value)}
                optionType="button"
                buttonStyle="solid"
                className="flex w-full"
              >
                <Radio.Button value="PAYOS" className="flex-1 text-center">
                  <span className="inline-flex items-center gap-2">
                    <CreditCard size={15} /> PayOS
                  </span>
                </Radio.Button>
                <Radio.Button value="CASH" className="flex-1 text-center">
                  <span className="inline-flex items-center gap-2">
                    <Banknote size={15} /> Cash
                  </span>
                </Radio.Button>
              </Radio.Group>
              <p className="mt-3 text-xs text-slate-500">
                {paymentMethod === "CASH"
                  ? "Collect cash and check out directly without opening the payment page."
                  : "Continue to PayOS to complete the online payment first."}
              </p>
            </>
          )}
        </div>
      )}

      {!isPaid && !isDriver && paymentMethod === "PAYOS" && (
        <ActionButton
          onClick={onGoPayment}
          icon={<CreditCard size={22} />}
          label="Proceed to Payment"
          gradient={getCheckModeTheme(CHECK_MODES.DRIVER_WALK_IN).buttonGradient}
          shadow={getCheckModeTheme(CHECK_MODES.DRIVER_WALK_IN).buttonShadow}
        />
      )}

      {((isPaid && showCheckout) || isCashCheckout || isDriverCashAtGate) && (
        <ActionButton
          onClick={onConfirmCheckout}
          disabled={checkoutLoading || !hasCheckoutImage}
          loading={checkoutLoading}
          icon={<LogOut size={22} />}
          label={
            (!isPaid && isDriver) || isCashCheckout
              ? "Collect Cash & Check-out"
              : "Confirm Check-out"
          }
          gradient={hasCheckoutImage ? guestTheme.buttonGradient : "#94a3b8"}
          shadow={hasCheckoutImage ? guestTheme.buttonShadow : "none"}
        />
      )}

      {isPaid && !showCheckout && (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle2 className="text-emerald-600" size={20} />
            <div>
              <p className="font-bold text-emerald-800 text-sm">Payment completed</p>
              <p className="text-xs text-emerald-600">
                Upload plate image (if not done) and proceed to check out.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onStartCheckout}
            className="w-full flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white cursor-pointer transition-colors"
            style={{
              background: guestTheme.buttonGradient,
            }}
          >
            <LogOut size={16} />
            Start Check Out
          </button>
        </div>
      )}
    </div>
  );
};

const ActionButton = ({ onClick, disabled, loading, icon, label, gradient, shadow }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="w-full flex items-center justify-center gap-3 rounded-2xl py-4 text-lg font-bold text-white transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
    style={{ background: gradient, boxShadow: shadow }}
  >
    {loading && <Spin size="small" />}
    {icon}
    {label}
  </button>
);

export default ExitCheckoutActions;
