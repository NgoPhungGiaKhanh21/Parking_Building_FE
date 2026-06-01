import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Table, Tag, Tooltip, Popconfirm } from "antd";
import { getAllUserRequest } from "../../../redux/admin/GetAllUser/getAllUserSlice";
import { changeStatusUserRequest } from "../../../redux/admin/ChangeStatusUser/ChangeStatusUserSlice";
import {
  Users,
  Mail,
  Phone,
  ShieldCheck,
  Activity,
  Lock,
  Unlock,
} from "lucide-react";
import CommonBreadcrumb from "../../../components/Commandbreadcrumb/Commandbreadcrumb";

const UserManagement = () => {
  const dispatch = useDispatch();

  const { getAllUser, loading } = useSelector((state) => state.getAllUser);

  useEffect(() => {
    dispatch(getAllUserRequest());
  }, [dispatch]);

  // CẬP NHẬT HÀM NÀY: Truyền payload là 1 object { userId, status }
  const handleBanUser = (userId) => {
    dispatch(changeStatusUserRequest({ userId: userId, status: "BAN" }));
  };

  const handleUnbanUser = (userId) => {
    dispatch(changeStatusUserRequest({ userId: userId, status: "ACTIVE" }));
  };

  const filteredUsers =
    getAllUser?.filter((user) => user.role !== "ADMIN") || [];

  const columns = [
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      render: (text) => (
        <span className="font-medium text-slate-800">{text || "N/A"}</span>
      ),
    },
    {
      title: (
        <span className="flex items-center gap-2">
          <Mail size={16} className="text-slate-500" /> Username (Email)
        </span>
      ),
      dataIndex: "username",
      key: "username",
      render: (text) => <span className="text-slate-600">{text}</span>,
    },
    {
      title: (
        <span className="flex items-center gap-2">
          <Phone size={16} className="text-slate-500" /> Phone
        </span>
      ),
      dataIndex: "phone",
      key: "phone",
      render: (text) => (
        <span className="text-slate-600">{text || "Not provided"}</span>
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
      render: (role) => {
        let color = "default";
        switch (role) {
          case "ADMIN":
            color = "magenta";
            break;
          case "MANAGER":
            color = "purple";
            break;
          case "STAFF":
            color = "cyan";
            break;
          case "DRIVER":
            color = "blue";
            break;
          default:
            color = "default";
        }
        return (
          <Tag
            color={color}
            className="font-semibold px-3 py-1 rounded-full border-transparent"
          >
            {role}
          </Tag>
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
        // Cập nhật lại UI dựa trên status thực tế của API
        const isActive = status === "ACTIVE";
        const color = isActive ? "success" : "error";
        return (
          <Tag
            color={color}
            className="font-semibold px-3 py-1 rounded-full border-transparent"
          >
            {status}
          </Tag>
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
          <div className="flex items-center justify-center gap-3">
            {isActive ? (
              <Popconfirm
                title="Ban this user?"
                description="Are you sure you want to ban this user's access?"
                onConfirm={() => handleBanUser(record.userId)}
                okText="Yes, Ban"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <Tooltip title="Ban User">
                  <button className="flex items-center justify-center text-red-600 hover:text-red-700 transition-colors p-2 bg-red-50 hover:bg-red-100 rounded-lg border border-red-100">
                    <Lock size={16} />
                  </button>
                </Tooltip>
              </Popconfirm>
            ) : (
              <Popconfirm
                title="Unban this user?"
                description="Allow this user to access the system again?"
                onConfirm={() => handleUnbanUser(record.userId)}
                okText="Yes, Unban"
                cancelText="Cancel"
                okButtonProps={{
                  className: "!bg-green-500 hover:!bg-green-600",
                }}
              >
                <Tooltip title="Unban User">
                  <button className="flex items-center justify-center text-green-600 hover:text-green-700 transition-colors p-2 bg-green-50 hover:bg-green-100 rounded-lg border border-green-100">
                    <Unlock size={16} />
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
