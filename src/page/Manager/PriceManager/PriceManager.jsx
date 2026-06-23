import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Form, Input, Popconfirm, Table, Tag } from "antd";
import {
  CircleDollarSign,
  Eye,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
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
    if (!keyword) return policyList;
    return policyList.filter(
      (p) =>
        p.policyName?.toLowerCase().includes(keyword) ||
        p.typeName?.toLowerCase().includes(keyword) ||
        p.vehicleTypeName?.toLowerCase().includes(keyword) ||
        p.status?.toLowerCase().includes(keyword),
    );
  }, [policyList, searchText]);

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
      title: "Policy Name",
      dataIndex: "policyName",
      key: "policyName",
      fixed: "left",
      render: (v) => (
        <span className="font-semibold text-slate-800">{v || "—"}</span>
      ),
    },
    {
      title: "Vehicle Type",
      dataIndex: "vehicleTypeId",
      key: "vehicleTypeId",
      render: (_, record) => (
        <div>
          <p className="text-sm text-slate-700">{getVehicleTypeName(record)}</p>
        </div>
      ),
    },
    {
      title: "Base Price",
      dataIndex: "basePrice",
      key: "basePrice",
      render: formatCurrency,
    },
    {
      title: "Hourly Rate",
      dataIndex: "hourlyRate",
      key: "hourlyRate",
      render: formatCurrency,
    },
    {
      title: "Max Hours",
      dataIndex: "maxHours",
      key: "maxHours",
      render: (v) => (v != null ? `${v}h` : "—"),
    },
    {
      title: "Effective From",
      dataIndex: "effectiveFrom",
      key: "effectiveFrom",
      render: formatDateTime,
    },
    {
      title: "Effective To",
      dataIndex: "effectiveTo",
      key: "effectiveTo",
      render: formatDateTime,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "ACTIVE" ? "green" : "red"}>
          {status === "ACTIVE" ? "Active" : status === "INACTIVE" ? "Inactive" : status || "—"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      fixed: "right",
      render: (_, record) => {
        const policyId = getPolicyId(record);
        return (
          <div className="flex items-center justify-center gap-1">
            <Button
              size="small"
              icon={<Eye size={14} />}
              onClick={() => openDetail(policyId)}
            />
            <Button
              size="small"
              icon={<Pencil size={14} />}
              onClick={() => openUpdate(record)}
            />
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
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8">
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <CommonBreadcrumb role="Manager" page="pricepolicy" />
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 text-amber-600">
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
          <div className="flex gap-2">
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

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold text-slate-800">Policy List</h2>
          <Input
            placeholder="Search policy..."
            prefix={<Search size={16} className="text-slate-400" />}
            className="max-w-xs"
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <Table
          columns={columns}
          dataSource={filteredList}
          rowKey={(r) => getPolicyId(r)}
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 1200 }}
        />
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
  );
};

export default PriceManager;
