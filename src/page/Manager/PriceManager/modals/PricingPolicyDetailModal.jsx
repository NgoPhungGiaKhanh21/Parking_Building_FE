import { Modal, Spin, Tag } from "antd";
import {
  formatCurrency,
  formatDateTime,
  formatTierDetail,
  getVehicleTypeName,
  TIER_PRICING_CONFIG,
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
    width={820}
    styles={{ body: { maxHeight: "70vh", overflowY: "auto" } }}
  >
    {loading ? (
      <div className="flex min-h-[240px] items-center justify-center">
        <Spin size="large" />
      </div>
    ) : (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <DetailItem label="Tên chính sách" value={policy?.policyName} />
          <DetailItem label="Loại xe" value={getVehicleTypeName(policy)} />
          <DetailItem label="Kiểu tính phí" value={policy?.pricingType} />
          <DetailItem
            label="Trạng thái"
            value={
              policy?.status ? (
                <Tag color={policy.status === "ACTIVE" ? "green" : "red"}>
                  {policy.status === "ACTIVE" ? "Đang áp dụng" : "Ngừng áp dụng"}
                </Tag>
              ) : (
                "—"
              )
            }
          />
          <DetailItem label="Giá cơ bản" value={formatCurrency(policy?.basePrice)} />
          <DetailItem label="Giá mỗi giờ" value={formatCurrency(policy?.hourlyRate)} />
          <DetailItem
            label="Phí qua đêm"
            value={formatCurrency(policy?.overnightFee)}
          />
          <DetailItem
            label="Phí mất vé"
            value={formatCurrency(policy?.lostTicketFee)}
          />
          <DetailItem
            label="Hệ số giờ cao điểm"
            value={policy?.peakHourMultiplier ?? "—"}
          />
          <DetailItem
            label="Phí tối đa / ngày"
            value={formatCurrency(policy?.maxDailyFee)}
          />
          <DetailItem
            label="Phụ phí mỗi ngày tiếp theo"
            value={
              policy?.perDayPrice != null
                ? `+${formatCurrency(policy.perDayPrice)}/ngày`
                : "—"
            }
          />
          <DetailItem
            label="Hiệu lực từ"
            value={formatDateTime(policy?.effectiveFrom)}
          />
          <DetailItem
            label="Hiệu lực đến"
            value={formatDateTime(policy?.effectiveTo)}
          />
          <div className="md:col-span-2">
            <DetailItem
              label="Ngày tạo"
              value={formatDateTime(policy?.createdAt)}
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-bold text-slate-700">
            Cách tính phí theo bậc
          </p>
          <div className="mb-3 overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-left text-slate-600">
                <tr>
                  <th className="px-3 py-2 font-semibold">Thời gian gửi</th>
                  <th className="px-3 py-2 font-semibold">Phí</th>
                </tr>
              </thead>
              <tbody>
                {TIER_PRICING_CONFIG.map((tier) => (
                  <tr key={tier.hours} className="border-t border-slate-200">
                    <td className="px-3 py-2 text-slate-700">{tier.rangeLabel}</td>
                    <td className="px-3 py-2 font-medium text-slate-800">
                      {formatCurrency(policy?.[tier.price])}
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-slate-200 bg-amber-50/50">
                  <td className="px-3 py-2 text-slate-700">Mỗi ngày tiếp theo</td>
                  <td className="px-3 py-2 font-medium text-amber-800">
                    +{formatCurrency(policy?.perDayPrice)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {TIER_PRICING_CONFIG.map((tier) => (
              <div
                key={tier.hours}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
              >
                <p className="text-xs text-slate-500">{tier.description}</p>
                <p className="mt-1 text-sm font-medium text-slate-800">
                  {formatTierDetail(policy, tier)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
  </Modal>
);

export default PricingPolicyDetailModal;
