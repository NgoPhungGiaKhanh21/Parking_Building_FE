import { Modal, Spin, Tag } from "antd";
import {
  formatCurrency,
  formatDateTime,
  getVehicleTypeName,
} from "../utils/pricingPolicyUtils";

const DetailItem = ({ label, value }) => (
  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
      {label}
    </p>
    <p className="mt-1 text-sm font-medium text-slate-800">{value ?? "—"}</p>
  </div>
);

const PricingPolicyDetailModal = ({ open, onCancel, loading, policy }) => (
  <Modal
    title="Pricing Policy Detail"
    open={open}
    onCancel={onCancel}
    footer={null}
    width={720}
  >
    {loading ? (
      <div className="flex min-h-[240px] items-center justify-center">
        <Spin size="large" />
      </div>
    ) : (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <DetailItem label="Policy Name" value={policy?.policyName} />
        <DetailItem label="Vehicle Type" value={getVehicleTypeName(policy)} />
        <DetailItem label="Vehicle Type ID" value={policy?.vehicleTypeId} />
        <DetailItem label="Pricing Type" value={policy?.pricingType} />
        <DetailItem
          label="Status"
          value={
            policy?.status ? (
              <Tag color={policy.status === "ACTIVE" ? "green" : "red"}>
                {policy.status}
              </Tag>
            ) : (
              "—"
            )
          }
        />
        <DetailItem label="Base Price" value={formatCurrency(policy?.basePrice)} />
        <DetailItem label="Hourly Rate" value={formatCurrency(policy?.hourlyRate)} />
        <DetailItem
          label="Overnight Fee"
          value={formatCurrency(policy?.overnightFee)}
        />
        <DetailItem
          label="Lost Ticket Fee"
          value={formatCurrency(policy?.lostTicketFee)}
        />
        <DetailItem
          label="Peak Hour Multiplier"
          value={policy?.peakHourMultiplier ?? "—"}
        />
        <DetailItem
          label="Max Daily Fee"
          value={formatCurrency(policy?.maxDailyFee)}
        />
        <DetailItem
          label="Effective From"
          value={formatDateTime(policy?.effectiveFrom)}
        />
        <DetailItem
          label="Effective To"
          value={formatDateTime(policy?.effectiveTo)}
        />
        <div className="md:col-span-2">
          <DetailItem
            label="Created At"
            value={formatDateTime(policy?.createdAt)}
          />
        </div>
      </div>
    )}
  </Modal>
);

export default PricingPolicyDetailModal;
