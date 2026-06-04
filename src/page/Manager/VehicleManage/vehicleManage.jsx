import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Select, Table, Card, Tag, Empty, Button, Popconfirm } from "antd";
import { CarFront, UserSearch, RefreshCw } from "lucide-react";

import { getAllDriverRequest } from "../../../redux/manager/Vehicle/getAllDriver/getAllDriverSlice";
import { getVehicleManageRequest } from "../../../redux/manager/Vehicle/getVehicleManage/getVehicleManageSlice";
// Thêm import cho action thay đổi trạng thái
import { changeStatusVehicleRequest } from "../../../redux/manager/Vehicle/changeStatusVehicle/changeStatusVehicleSlice";

const VehicleManagement = () => {
  const dispatch = useDispatch();
  const [selectedDriverId, setSelectedDriverId] = useState(null);

  // Get state from Redux store
  const { getAllDriver: driversList, loading: isDriversLoading } = useSelector(
    (state) => state.getAllDriver,
  );

  const { getVehicleManage: vehiclesList, loading: isVehiclesLoading } =
    useSelector((state) => state.getVehicleManage);

  const { loading: isChangingStatus } = useSelector(
    (state) => state.changeStatusVehicle,
  );

  // Call API to fetch Driver list on component mount
  useEffect(() => {
    dispatch(getAllDriverRequest());
  }, [dispatch]);

  // Handle when a user selects a Driver from the Dropdown
  const handleDriverChange = (userId) => {
    setSelectedDriverId(userId);
    // Pass userId to action to fetch the vehicle list
    dispatch(getVehicleManageRequest(userId));
  };

  // Hàm xử lý đổi trạng thái
  const handleToggleStatus = (vehicleId, currentStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    dispatch(
      changeStatusVehicleRequest({
        vehicleId: vehicleId,
        status: newStatus,
        userId: selectedDriverId, // Truyền thêm userId để Saga gọi lại API fetch list
      }),
    );
  };

  // Column configuration for Vehicle table
  const columns = [
    {
      title: "Plate Number",
      dataIndex: "plateNumber",
      key: "plateNumber",
      render: (text) => (
        <span className="font-bold text-slate-700">{text}</span>
      ),
    },
    {
      title: "Brand",
      dataIndex: "brand",
      key: "brand",
    },
    {
      title: "Model",
      dataIndex: "model",
      key: "model",
    },
    {
      title: "Color",
      dataIndex: "vehicleColor",
      key: "vehicleColor",
      render: (color) => (
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
            style={{ backgroundColor: color?.toLowerCase() || "#ccc" }}
          ></div>
          <span className="capitalize">{color}</span>
        </div>
      ),
    },
    {
      title: "Vehicle Type",
      dataIndex: "vehicleTypeName",
      key: "vehicleTypeName",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = status === "ACTIVE" ? "green" : "volcano";
        return (
          <Tag color={color} className="font-semibold">
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => {
        const isCurrentlyActive = record.status === "ACTIVE";
        const targetStatus = isCurrentlyActive ? "INACTIVE" : "ACTIVE";

        return (
          <Popconfirm
            title="Confirm Status Change"
            description={`Are you sure you want to set this vehicle to ${targetStatus}?`}
            onConfirm={() =>
              handleToggleStatus(record.vehicleId, record.status)
            }
            okText="Yes"
            cancelText="No"
          >
            <Button
              type={isCurrentlyActive ? "default" : "primary"}
              danger={isCurrentlyActive}
              size="small"
              icon={<RefreshCw className="w-3 h-3" />}
              className="flex items-center gap-1"
            >
              Set {targetStatus}
            </Button>
          </Popconfirm>
        );
      },
    },
  ];

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <CarFront className="w-7 h-7 text-indigo-600" />
          Vehicle Management
        </h1>
        <p className="text-slate-500 mt-1">
          Select a driver to view their associated vehicles
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Select Driver Section */}
        <Card className="shadow-sm border-slate-200 rounded-xl">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-2 text-slate-700 font-semibold w-48">
              <UserSearch className="w-5 h-5 text-indigo-500" />
              Select Driver:
            </div>

            <div className="flex-1 max-w-md">
              <Select
                showSearch
                placeholder="Search and select driver..."
                className="w-full h-11"
                loading={isDriversLoading}
                onChange={handleDriverChange}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={
                  driversList?.map((driver) => ({
                    value: driver.userId,
                    label: `${driver.fullName || "No Name"} (${driver.username}) - ${driver.email}`,
                  })) || []
                }
              />
            </div>
          </div>
        </Card>

        {/* Vehicle Table Display Section */}
        <Card className="shadow-sm border-slate-200 rounded-xl min-h-[400px]">
          {!selectedDriverId ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <CarFront className="w-16 h-16 mb-4 opacity-20" />
              <p>Please select a driver above to view their vehicle list</p>
            </div>
          ) : (
            <div className="animate-in fade-in duration-300">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-700">
                  Driver's Vehicle List
                </h2>
                <div className="flex gap-2">
                  <Tag
                    color="blue"
                    className="px-3 py-1 text-sm rounded-full flex items-center"
                  >
                    Total: {vehiclesList?.length || 0} vehicle(s)
                  </Tag>
                </div>
              </div>

              <Table
                columns={columns}
                dataSource={vehiclesList}
                rowKey="vehicleId"
                loading={isVehiclesLoading || isChangingStatus}
                pagination={{ pageSize: 10 }}
                locale={{
                  emptyText: (
                    <Empty description="This driver has no vehicles yet" />
                  ),
                }}
                className="border border-slate-100 rounded-lg overflow-hidden shadow-sm"
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default VehicleManagement;
