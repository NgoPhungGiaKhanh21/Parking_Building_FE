import { Button, Modal, Spin, Tag } from "antd";
import {
  CalendarRange,
  CircleDollarSign,
  Clock3,
  Gauge,
} from "lucide-react";
import {
  formatCurrency,
  formatDateTime,
  getVehicleTypeName,
} from "../utils/pricingPolicyUtils";

const SectionTitle = ({ icon: Icon, children }) => (
  <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
    <Icon size={14} />
    {children}
  </div>
);

const Field = ({ label, children, className = "" }) => (
  <div className={className}>
    <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
    <div className="mt-1 text-sm text-slate-800">{children}</div>
  </div>
);

const PricingPolicyDetailModal = ({ open, onCancel, loading, policy }) => {
  const isActive = policy?.status === "ACTIVE";

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={<Button onClick={onCancel}>Close</Button>}
      width={560}
      centered
      destroyOnClose
      title={
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <CircleDollarSign size={20} />
          </div>
          <div>
            <p className="font-bold text-slate-800">Pricing Policy Details</p>
            <p className="text-xs font-normal text-slate-500">
              Full information about this pricing rule.
            </p>
          </div>
        </div>
      }
    >
      {loading ? (
        <div className="flex min-h-[240px] items-center justify-center">
          <Spin size="large" />
        </div>
      ) : !policy ? (
        <p className="py-8 text-center text-sm text-slate-400">
          Policy details are not available.
        </p>
      ) : (
        <div className="mt-2 space-y-5">
          <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase text-amber-700/70">
                  Policy
                </p>
                <p className="mt-1 break-words text-lg font-bold text-slate-800">
                  {policy.policyName || "—"}
                </p>
                <Tag color="blue" className="mt-2">
                  {getVehicleTypeName(policy)}
                </Tag>
              </div>
              <Tag color={isActive ? "green" : "red"} className="m-0 px-3 py-1">
                {isActive ? "Active" : "Inactive"}
              </Tag>
            </div>
          </div>

          <div>
            <SectionTitle icon={Gauge}>Pricing</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                {
                  label: "Base price",
                  value: formatCurrency(policy.basePrice),
                },
                {
                  label: "Hourly rate",
                  value: formatCurrency(policy.hourlyRate),
                },
                {
                  label: "Max hours",
                  value:
                    policy.maxHours != null ? `${policy.maxHours} hrs` : "—",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3"
                >
                  <p className="text-xs text-slate-500">{item.label}</p>
                  <p className="mt-1 text-base font-bold text-slate-800">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionTitle icon={CalendarRange}>Validity period</SectionTitle>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Effective from">
                  <span className="font-semibold">
                    {formatDateTime(policy.effectiveFrom)}
                  </span>
                </Field>
                <Field label="Effective to">
                  <span className="font-semibold">
                    {formatDateTime(policy.effectiveTo)}
                  </span>
                </Field>
              </div>
            </div>
          </div>

          {(policy.createdAt || policy.updatedAt) && (
            <div>
              <SectionTitle icon={Clock3}>Record info</SectionTitle>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {policy.createdAt && (
                  <Field label="Created at">
                    {formatDateTime(policy.createdAt)}
                  </Field>
                )}
                {policy.updatedAt && (
                  <Field label="Updated at">
                    {formatDateTime(policy.updatedAt)}
                  </Field>
                )}
              </div>
            </div>
          )}

        </div>
      )}
    </Modal>
  );
};

export default PricingPolicyDetailModal;
