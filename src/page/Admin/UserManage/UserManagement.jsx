import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Avatar,
  Button,
  Input,
  Popconfirm,
  Select,
  Table,
  Tag,
  Tooltip,
} from "antd";
import { getAllUserRequest } from "../../../redux/admin/getAllUser/getAllUserSlice";
import { changeStatusUserRequest } from "../../../redux/admin/changeStatusUser/ChangeStatusUserSlice";
import { changeRoleUserRequest } from "../../../redux/admin/changeRoleUser/changeRoleUserSlice";
import {
  Users,
  Mail,
  Phone,
  ShieldCheck,
  Activity,
  Lock,
  Unlock,
  User,
  AlertCircle,
  Info,
  Search,
} from "lucide-react";
import CommonBreadcrumb from "../../../components/Commandbreadcrumb/Commandbreadcrumb";

const UserManagement = () => {
  const dispatch = useDispatch();
  const [userNameFilter, setUserNameFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);

  const { getAllUser, loading } = useSelector((state) => state.getAllUser);

  useEffect(() => {
    dispatch(getAllUserRequest());
  }, [dispatch]);

  const handleBanUser = (userId) => {
    dispatch(changeStatusUserRequest({ userId: userId, status: "BANNED" }));
  };

  const handleUnbanUser = (userId) => {
    dispatch(changeStatusUserRequest({ userId: userId, status: "ACTIVE" }));
  };

  const handleRoleChange = (userId, newRole) => {
    dispatch(changeRoleUserRequest({ userId: userId, role: newRole }));
  };

  const userList = Array.isArray(getAllUser?.data) ? getAllUser.data : [];
  const filteredUsers = useMemo(() => {
    const nameKeyword = userNameFilter.trim().toLowerCase();
    const emailKeyword = emailFilter.trim().toLowerCase();
    return userList.filter((user) => {
      const isNotAdmin = user.role !== "ROLE_ADMIN";
      const matchesName =
        !nameKeyword ||
        String(user.fullName || "")
          .toLowerCase()
          .includes(nameKeyword);
      const matchesEmail =
        !emailKeyword ||
        String(user.email || "")
          .toLowerCase()
          .includes(emailKeyword);
      const matchesRole = !roleFilter || user.role === roleFilter;
      const matchesStatus =
        !statusFilter ||
        (statusFilter === "ACTIVE" && user.status === "ACTIVE") ||
        (statusFilter === "INACTIVE" && user.status !== "ACTIVE");
      return (
        isNotAdmin &&
        matchesName &&
        matchesEmail &&
        matchesRole &&
        matchesStatus
      );
    });
  }, [emailFilter, roleFilter, statusFilter, userList, userNameFilter]);

  const resetFilters = () => {
    setUserNameFilter("");
    setEmailFilter("");
    setRoleFilter(null);
    setStatusFilter(null);
  };

  // 1. Định nghĩa sẵn UI của các Role để tái sử dụng
  const roleDefinitions = {
    ROLE_MANAGER: {
      value: "ROLE_MANAGER",
      label: (
        <Tag
          color="purple"
          className="font-bold px-2 py-1 rounded border-0 uppercase text-[10px] w-full text-center m-0"
        >
          MANAGER
        </Tag>
      ),
    },
    ROLE_STAFF: {
      value: "ROLE_STAFF",
      label: (
        <Tag
          color="cyan"
          className="font-bold px-2 py-1 rounded border-0 uppercase text-[10px] w-full text-center m-0"
        >
          STAFF
        </Tag>
      ),
    },
    ROLE_DRIVER: {
      value: "ROLE_DRIVER",
      label: (
        <Tag
          color="blue"
          className="font-bold px-2 py-1 rounded border-0 uppercase text-[10px] w-full text-center m-0"
        >
          DRIVER
        </Tag>
      ),
    },
  };

  // 2. Hàm xử lý logic hiển thị option theo Role hiện tại của user
  const getDynamicRoleOptions = (currentRole) => {
    // Luôn giữ role hiện tại trong mảng để Select render được UI, nhưng disable không cho chọn lại chính nó
    const currentOption = { ...roleDefinitions[currentRole], disabled: true };
    let allowedOptions = [currentOption];

    if (currentRole === "ROLE_DRIVER") {
      // Driver hiển thị thêm Staff và Manager
      allowedOptions.push(
        roleDefinitions.ROLE_STAFF,
        roleDefinitions.ROLE_MANAGER,
      );
    } else if (currentRole === "ROLE_STAFF") {
      // Staff chỉ hiển thị Manager (có thể bổ sung ROLE_DRIVER nếu bạn cho phép giáng chức về Driver)
      allowedOptions.push(roleDefinitions.ROLE_MANAGER);
    } else if (currentRole === "ROLE_MANAGER") {
      // Manager sẽ về Staff
      allowedOptions.push(roleDefinitions.ROLE_STAFF);
    }

    return allowedOptions;
  };

  const columns = [
    {
      title: "User",
      key: "userInfo",
      fixed: "left",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={record.avatarUrl}
            icon={!record.avatarUrl && <User size={18} />}
            size={42}
            className="shrink-0 border border-slate-100 bg-blue-50 text-blue-500"
          />
          <div className="flex flex-col">
            <span className="font-bold text-slate-800 leading-tight">
              {record.fullName || "N/A"}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: (
        <span className="flex items-center gap-2">
          <Mail size={16} className="text-slate-500" /> Account (Email)
        </span>
      ),
      key: "account",
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="text-slate-700 font-medium">
            {record.email || "N/A"}
          </span>
          <span className="text-slate-400 text-xs">@{record.username}</span>
        </div>
      ),
    },
    {
      title: (
        <span className="flex items-center gap-2">
          <Phone size={16} className="text-slate-500" /> Phone
        </span>
      ),
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      render: (text) => (
        <span className="text-slate-600 font-medium">{text || "—"}</span>
      ),
    },
    {
      title: (
        <span className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-slate-500" /> Role
        </span>
      ),
      dataIndex: "role",
      key: "role",
      sorter: (a, b) => {
        const roleOrder = {
          ROLE_DRIVER: 1,
          ROLE_STAFF: 2,
          ROLE_MANAGER: 3,
        };
        const orderA = roleOrder[a.role] || 99;
        const orderB = roleOrder[b.role] || 99;

        return orderA - orderB;
      },
      render: (role, record) => {
        // Vô hiệu hóa toàn bộ nếu người dùng là ADMIN
        if (role === "ROLE_ADMIN") {
          return (
            <Tag
              color="magenta"
              className="font-bold px-3 py-1 rounded-full border-0 uppercase text-[10px]"
            >
              ADMIN
            </Tag>
          );
        }

        return (
          <Select
            value={role}
            onChange={(newRole) => handleRoleChange(record.userId, newRole)}
            className="w-32"
            bordered={false}
            dropdownStyle={{ minWidth: "120px" }}
            // 3. Truyền logic lấy Options vào đây
            options={getDynamicRoleOptions(role)}
          />
        );
      },
    },
    {
      title: (
        <span className="flex items-center gap-2">
          <Activity size={16} className="text-slate-500" /> Status
        </span>
      ),
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const isActive = status === "ACTIVE";
        return (
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"}`}
            />
            <span
              className={`font-semibold ${isActive ? "text-green-600" : "text-red-600"}`}
            >
              {status}
            </span>
          </div>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_, record) => {
        const isActive = record.status === "ACTIVE";
        return (
          <div className="flex items-center justify-center gap-2">
            {isActive ? (
              <Popconfirm
                title={
                  <span className="font-bold text-slate-800 text-sm">
                    Ban this user?
                  </span>
                }
                description={
                  <span className="text-slate-500 text-xs">
                    They will lose access to the system.
                  </span>
                }
                icon={<AlertCircle size={18} className="text-red-500 mt-0.5" />}
                onConfirm={() => handleBanUser(record.userId)}
                okText="Ban User"
                cancelText="Cancel"
                placement="topRight"
                okButtonProps={{
                  danger: true,
                  className:
                    "bg-red-500 hover:bg-red-600 border-none shadow-sm rounded-md font-medium text-xs px-3",
                }}
                cancelButtonProps={{
                  className:
                    "border-slate-200 text-slate-600 hover:text-slate-800 hover:border-slate-300 hover:bg-slate-50 rounded-md font-medium text-xs px-3",
                }}
              >
                <Tooltip title="Ban User">
                  <button className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors">
                    <Lock size={18} />
                  </button>
                </Tooltip>
              </Popconfirm>
            ) : (
              <Popconfirm
                title={
                  <span className="font-bold text-slate-800 text-sm">
                    Unban this user?
                  </span>
                }
                description={
                  <span className="text-slate-500 text-xs">
                    Restore their access to the system.
                  </span>
                }
                icon={<Info size={18} className="text-blue-500 mt-0.5" />}
                onConfirm={() => handleUnbanUser(record.userId)}
                okText="Unban"
                cancelText="Cancel"
                placement="topRight"
                okButtonProps={{
                  className:
                    "bg-green-500 hover:bg-green-600 border-none shadow-sm rounded-md font-medium text-white text-xs px-3",
                }}
                cancelButtonProps={{
                  className:
                    "border-slate-200 text-slate-600 hover:text-slate-800 hover:border-slate-300 hover:bg-slate-50 rounded-md font-medium text-xs px-3",
                }}
              >
                <Tooltip title="Unban User">
                  <button className="p-2 text-green-500 hover:bg-green-50 rounded-full transition-colors">
                    <Unlock size={18} />
                  </button>
                </Tooltip>
              </Popconfirm>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8">
      <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
        <div className="mb-4">
          <CommonBreadcrumb role={"Admin"} page={"user"} />
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
              <Users size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 md:text-3xl tracking-tight">
                User Management
              </h1>
              <p className="mt-1 text-slate-500 font-medium">
                View and manage all users across the system.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-800">User List</h2>
          <Button onClick={resetFilters}>Reset Filters</Button>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Input
            allowClear
            value={userNameFilter}
            onChange={(event) => setUserNameFilter(event.target.value)}
            placeholder="Filter by user name"
            prefix={<Search size={16} className="text-slate-400" />}
          />
          <Input
            allowClear
            value={emailFilter}
            onChange={(event) => setEmailFilter(event.target.value)}
            placeholder="Filter by email"
            prefix={<Mail size={16} className="text-slate-400" />}
          />
          <Select
            allowClear
            placeholder="Filter by role"
            value={roleFilter}
            onChange={(value) => setRoleFilter(value ?? null)}
            options={[
              { value: "ROLE_DRIVER", label: "Driver" },
              { value: "ROLE_STAFF", label: "Staff" },
              { value: "ROLE_MANAGER", label: "Manager" },
            ]}
          />
          <Select
            allowClear
            placeholder="Filter by status"
            value={statusFilter}
            onChange={(value) => setStatusFilter(value ?? null)}
            options={[
              { value: "ACTIVE", label: "Active" },
              { value: "INACTIVE", label: "Inactive" },
            ]}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="userId"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} users`,
            className: "px-4",
          }}
          rowClassName="hover:bg-slate-50 cursor-pointer transition-colors"
          scroll={{ x: 800 }}
        />
      </div>
    </div>
  );
};

export default UserManagement;
