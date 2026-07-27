import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Form,
  Input,
  Popconfirm,
  Select,
  Table,
  Tag,
} from "antd";
import {
  CheckCircle2,
  CircleDollarSign,
  Eye,
  ListFilter,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import CommonBreadcrumb from "../../../components/Commandbreadcrumb/Commandbreadcrumb";
import { getAllPricingPolicyRequest } from "../../../redux/manager/PricingPolicy/GetAllPricingPolicy/getAllPricingPolicySlice";
import {
  getPricingPolicyByIdRequest,
  resetPricingPolicyDetail,
} from "../../../redux/manager/PricingPolicy/GetPricingPolicyById/getPricingPolicyByIdSlice";
import {
  createPricingPolicyRequest,
  resetCreatePricingPolicyStatus,
} from "../../../redux/manager/PricingPolicy/CreatePricingPolicy/createPricingPolicySlice";
import {
  updatePricingPolicyRequest,
  resetUpdatePricingPolicyStatus,
} from "../../../redux/manager/PricingPolicy/UpdatePricingPolicy/updatePricingPolicySlice";
import {
  deletePricingPolicyRequest,
  resetDeletePricingPolicyStatus,
} from "../../../redux/manager/PricingPolicy/DeletePricingPolicy/deletePricingPolicySlice";
import { getVehicleTypeListRequest } from "../../../redux/manager/Building/getVehicleTypeList/getVehicleTypeListSlice";
import PricingPolicyFormModal from "./modals/PricingPolicyFormModal";
import PricingPolicyDetailModal from "./modals/PricingPolicyDetailModal";
import {
  buildPolicyPayload,
  formatCurrency,
  formatDateTime,
  getPolicyId,
  getVehicleTypeName,
  mapPolicyToForm,
} from "./utils/pricingPolicyUtils";

const PriceManager = () => {
  const dispatch = useDispatch();
  const [createForm] = Form.useForm();
  const [updateForm] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingPolicyId, setEditingPolicyId] = useState(null);

  const { policies, loading, error } = useSelector(
    (state) => state.getAllPricingPolicy,
  );
  const { policy: policyDetail, loading: detailLoading } = useSelector(
    (state) => state.getPricingPolicyById,
  );
  const { loading: createLoading, success: createSuccess } = useSelector(
    (state) => state.createPricingPolicy,
  );
  const { loading: updateLoading, success: updateSuccess } = useSelector(
    (state) => state.updatePricingPolicy,
  );
  const { loading: deleteLoading } = useSelector(
    (state) => state.deletePricingPolicy,
  );
  const { vehicleTypes } = useSelector((state) => state.getVehicleTypeList);

  const vehicleTypeList = Array.isArray(vehicleTypes) ? vehicleTypes : [];
  const policyList = Array.isArray(policies) ? policies : [];

  useEffect(() => {
    dispatch(getAllPricingPolicyRequest());
    dispatch(getVehicleTypeListRequest());
    return () => {
      dispatch(resetCreatePricingPolicyStatus());
      dispatch(resetUpdatePricingPolicyStatus());
      dispatch(resetDeletePricingPolicyStatus());
      dispatch(resetPricingPolicyDetail());
    };
  }, [dispatch]);

  useEffect(() => {
    if (!createSuccess) return;
    createForm.resetFields();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsCreateOpen(false);
    dispatch(resetCreatePricingPolicyStatus());
  }, [createSuccess, createForm, dispatch]);

  useEffect(() => {
    if (!updateSuccess) return;
    updateForm.resetFields();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsUpdateOpen(false);
    setEditingPolicyId(null);
    dispatch(resetUpdatePricingPolicyStatus());
  }, [updateSuccess, updateForm, dispatch]);

  const filteredList = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    return policyList.filter((policy) => {
      const matchesPolicyName =
        !keyword ||
        String(policy.policyName || "")
          .toLowerCase()
          .includes(keyword);
      const matchesVehicleType =
        !vehicleTypeFilter ||
        getVehicleTypeName(policy) === vehicleTypeFilter;

      return matchesPolicyName && matchesVehicleType;
    });
  }, [policyList, searchText, vehicleTypeFilter]);

  const summary = useMemo(
    () => ({
      total: policyList.length,
      active: policyList.filter((p) => p.status === "ACTIVE").length,
      inactive: policyList.filter((p) => p.status === "INACTIVE").length,
    }),
    [policyList],
  );

  const vehicleTypeFilterOptions = useMemo(
    () =>
      [...new Set(policyList.map(getVehicleTypeName))]
        .filter((name) => name && name !== "—")
        .map((name) => ({ value: name, label: name })),
    [policyList],
  );

  const resetFilters = () => {
    setSearchText("");
    setVehicleTypeFilter(null);
  };

  const openDetail = (policyId) => {
    setIsDetailOpen(true);
    dispatch(getPricingPolicyByIdRequest(policyId));
  };

  const closeDetail = () => {
    setIsDetailOpen(false);
    dispatch(resetPricingPolicyDetail());
  };

  const openUpdate = (record) => {
    const policyId = getPolicyId(record);
    setEditingPolicyId(policyId);
    setIsUpdateOpen(true);
    updateForm.setFieldsValue(mapPolicyToForm(record));
  };

  const columns = [
    {
      title: "Policy",
      key: "policy",
      render: (_, record) => (
        <div className="min-w-0 break-words pr-2">
          <p className="m-0 font-semibold text-slate-800">
            {record.policyName || "—"}
          </p>
          <Tag color="blue" className="mt-1">
            {getVehicleTypeName(record)}
          </Tag>
        </div>
      ),
    },
    {
      title: "Pricing",
      key: "pricing",
      render: (_, record) => (
        <div className="min-w-0 text-sm text-slate-600">
          <p className="m-0">
            Base:{" "}
            <span className="font-semibold text-slate-800">
              {formatCurrency(record.basePrice)}
            </span>
          </p>
          <p className="m-0 mt-0.5">
            Hourly:{" "}
            <span className="font-semibold text-slate-800">
              {formatCurrency(record.hourlyRate)}
            </span>
          </p>
          <p className="m-0 mt-0.5 text-xs text-slate-500">
            Max {record.maxHours != null ? `${record.maxHours}h` : "—"}
          </p>
        </div>
      ),
    },
    {
      title: "Validity",
      key: "validity",
      render: (_, record) => (
        <div className="min-w-0 text-xs leading-relaxed text-slate-600">
          <p className="m-0 whitespace-nowrap">
            From: {formatDateTime(record.effectiveFrom)}
          </p>
          <p className="m-0 mt-0.5 whitespace-nowrap">
            To: {formatDateTime(record.effectiveTo)}
          </p>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status) => (
        <Tag color={status === "ACTIVE" ? "green" : "red"} className="m-0">
          {status === "ACTIVE"
            ? "Active"
            : status === "INACTIVE"
              ? "Inactive"
              : status || "—"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 220,
      align: "right",
      render: (_, record) => {
        const policyId = getPolicyId(record);
        return (
          <div className="flex flex-wrap items-center justify-end gap-1">
            <Button
              size="small"
              type="primary"
              ghost
              icon={<Eye size={14} />}
              onClick={() => openDetail(policyId)}
            >
              Detail
            </Button>
            <Button
              size="small"
              icon={<Pencil size={14} />}
              onClick={() => openUpdate(record)}
            >
              Edit
            </Button>
            <Popconfirm
              title="Delete this pricing policy?"
              onConfirm={() => dispatch(deletePricingPolicyRequest(policyId))}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <Button
                danger
                size="small"
                icon={<Trash2 size={14} />}
                loading={deleteLoading}
              />
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  return (
    <div className="w-full min-w-0 bg-slate-50 p-4 pb-8 md:p-8">
      <div className="mx-auto w-full min-w-0 max-w-screen-2xl">
        <div className="mb-5 overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm">
          <div className="h-1 bg-amber-400" />
          <div className="p-5 md:p-6">
            <CommonBreadcrumb role="Manager" page="pricepolicy" />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                  <CircleDollarSign size={28} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">
                    Price Policy Management
                  </h1>
                  <p className="text-slate-500">
                    Create and manage parking pricing policies.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  icon={<RefreshCw size={16} />}
                  loading={loading}
                  onClick={() => dispatch(getAllPricingPolicyRequest())}
                >
                  Refresh
                </Button>
                <Button
                  type="primary"
                  icon={<Plus size={16} />}
                  onClick={() => {
                    createForm.setFieldsValue({ status: "ACTIVE" });
                    setIsCreateOpen(true);
                  }}
                >
                  Create Policy
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            {
              label: "All policies",
              value: summary.total,
              icon: CircleDollarSign,
              color: "text-slate-600",
              background: "bg-slate-100",
            },
            {
              label: "Active",
              value: summary.active,
              icon: CheckCircle2,
              color: "text-emerald-600",
              background: "bg-emerald-50",
            },
            {
              label: "Inactive",
              value: summary.inactive,
              icon: XCircle,
              color: "text-red-600",
              background: "bg-red-50",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className="mt-1 text-2xl font-black text-slate-800">
                    {item.value}
                  </p>
                </div>
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.background} ${item.color}`}
                >
                  <item.icon size={22} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Policy List</h2>
              <p className="text-sm text-slate-500">
                Search and manage pricing rules by vehicle type.
              </p>
            </div>
            <Tag color="blue">{filteredList.length} shown</Tag>
          </div>

          <div className="m-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
              <ListFilter size={14} />
              Filters
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px_auto]">
              <Input
                placeholder="Filter by policy name"
                prefix={<Search size={16} className="text-slate-400" />}
                allowClear
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                placeholder="Filter by vehicle type"
                value={vehicleTypeFilter}
                onChange={(value) => setVehicleTypeFilter(value ?? null)}
                options={vehicleTypeFilterOptions}
              />
              <Button onClick={resetFilters}>Reset</Button>
            </div>
          </div>

          {error && (
            <div className="mx-4 mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="w-full min-w-0 px-4 pb-4">
            <Table
              columns={columns}
              dataSource={filteredList}
              rowKey={(r) => getPolicyId(r)}
              loading={loading}
              size="middle"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `${total} policies`,
              }}
            />
          </div>
        </div>

        <PricingPolicyFormModal
          open={isCreateOpen}
          title="Create Pricing Policy"
          onCancel={() => {
            setIsCreateOpen(false);
            createForm.resetFields();
            dispatch(resetCreatePricingPolicyStatus());
          }}
          form={createForm}
          loading={createLoading}
          vehicleTypes={vehicleTypeList}
          onSubmit={(values) =>
            dispatch(createPricingPolicyRequest(buildPolicyPayload(values)))
          }
        />

        <PricingPolicyFormModal
          open={isUpdateOpen}
          title="Update Pricing Policy"
          onCancel={() => {
            setIsUpdateOpen(false);
            setEditingPolicyId(null);
            updateForm.resetFields();
            dispatch(resetUpdatePricingPolicyStatus());
          }}
          form={updateForm}
          loading={updateLoading}
          vehicleTypes={vehicleTypeList}
          onSubmit={(values) =>
            dispatch(
              updatePricingPolicyRequest({
                id: editingPolicyId,
                data: buildPolicyPayload(values),
              }),
            )
          }
        />

        <PricingPolicyDetailModal
          open={isDetailOpen}
          onCancel={closeDetail}
          loading={detailLoading}
          policy={policyDetail}
        />
      </div>
    </div>
  );
};

export default PriceManager;
