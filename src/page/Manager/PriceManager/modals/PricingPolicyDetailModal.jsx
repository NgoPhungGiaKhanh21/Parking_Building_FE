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
    title="Chi tiết chính sách giá"
    open={open}
    onCancel={onCancel}
    footer={null}
    width={640}
    styles={{ body: { maxHeight: "70vh", overflowY: "auto" } }}
  >
    {loading ? (
      <div className="flex min-h-[240px] items-center justify-center">
        <Spin size="large" />
      </div>
    ) : (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <DetailItem label="vehicleTypeId" value={policy?.vehicleTypeId} />
        <DetailItem label="policyName" value={policy?.policyName} />
        <DetailItem label="Loại xe" value={getVehicleTypeName(policy)} />
        <DetailItem
          label="status"
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
        <DetailItem label="basePrice" value={formatCurrency(policy?.basePrice)} />
        <DetailItem label="hourlyRate" value={formatCurrency(policy?.hourlyRate)} />
        <DetailItem label="maxHours" value={policy?.maxHours ?? "—"} />
        <DetailItem
          label="effectiveFrom"
          value={formatDateTime(policy?.effectiveFrom)}
        />
        <DetailItem
          label="effectiveTo"
          value={formatDateTime(policy?.effectiveTo)}
        />
        {policy?.createdAt && (
          <DetailItem
            label="createdAt"
            value={formatDateTime(policy.createdAt)}
          />
        )}
      </div>
    )}
  </Modal>
);

export default PricingPolicyDetailModal;
