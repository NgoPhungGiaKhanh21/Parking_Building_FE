import { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar } from "antd";
import {
  LayoutDashboard,
  Building2,
  CarFront,
  CircleDollarSign,
  LogOut,
  ChevronLeft,
  User,
} from "lucide-react";

const SidebarManager = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("dashboard");

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      to: "/manager",
    },
    {
      id: "building",
      label: "Building",
      icon: Building2,
      to: "/manager/building",
    },
    {
      id: "parking-space",
      label: "Parking Space",
      icon: CarFront,
      to: "/manager/parking-space",
    },
    {
      id: "revenue",
      label: "Revenue",
      icon: CircleDollarSign,
      to: "/manager/revenue",
    },
  ];

  const handleToggle = () => setIsCollapsed((prev) => !prev);

  const handleLogout = () => {
    const confirmed = window.confirm("Do you want to log out of the system?");
    if (confirmed) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");

      window.location.href = "/";
    }
  };

  return (
    <div
      className="relative z-10 flex h-screen flex-shrink-0 flex-col overflow-visible transition-all duration-300 ease-in-out"
      style={{
        width: isCollapsed ? "88px" : "280px",
        background:
          "linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        boxShadow: "4px 0 24px rgba(0,0,0,0.35)",
      }}
    >
      {/* Decorative top accent */}
      <div
        className="absolute left-0 right-0 top-0 h-[3px]"
        style={{
          background: "linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)",
        }}
      />

      {/* 1. Header & Logo */}
      <div
        className={`relative flex min-h-[76px] items-center gap-3 border-b border-white/[0.07] px-4 pt-5 pb-4 ${
          isCollapsed ? "justify-center" : "justify-start"
        }`}
      >
        <div
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[14px]"
          style={{
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            boxShadow: "0 4px 15px rgba(99,102,241,0.5)",
          }}
        >
          <CarFront className="h-[22px] w-[22px] text-white" />
        </div>

        {!isCollapsed && (
          <div className="overflow-hidden">
            <div className="whitespace-nowrap text-sm font-extrabold leading-tight tracking-tight text-slate-200">
              Parking Management
            </div>
            <div
              className="whitespace-nowrap text-[11px] font-semibold tracking-wide"
              style={{
                background: "linear-gradient(90deg, #818cf8, #a78bfa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Building
            </div>
          </div>
        )}

        {/* Toggle Button */}
        <button
          onClick={handleToggle}
          title={isCollapsed ? "Mở rộng" : "Thu gọn"}
          className="absolute top-1/2 -right-4 z-20 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-2 border-slate-800 transition-all duration-200 hover:scale-110"
          style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            boxShadow:
              "0 0 0 3px rgba(99,102,241,0.25), 0 4px 12px rgba(0,0,0,0.4)",
          }}
        >
          <ChevronLeft
            className={`h-[15px] w-[15px] text-white transition-transform duration-300 ${
              isCollapsed ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* 2. User Avatar & Role Info */}
      <div
        className={`flex flex-col items-center gap-3 border-b border-white/[0.07] bg-white/[0.02] ${
          isCollapsed ? "px-2 py-4" : "px-4 py-5"
        }`}
      >
        <div className="relative">
          <div
            className="rounded-full p-[3px]"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            <Avatar
              size={isCollapsed ? 44 : 68}
              icon={<User />}
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Manager"
              style={{ display: "block", border: "2px solid #0f172a" }}
            />
          </div>
          <div className="absolute bottom-[2px] right-[2px] h-3 w-3 rounded-full bg-green-500 border-2 border-[#0f172a]" />
        </div>

        {!isCollapsed && (
          <div className="w-full overflow-hidden text-center">
            <span
              className="inline-block rounded-full px-3 py-[3px] text-[10px] font-bold uppercase tracking-widest text-indigo-300 border"
              style={{
                background:
                  "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))",
                borderColor: "rgba(99,102,241,0.4)",
              }}
            >
              Manager
            </span>
          </div>
        )}
      </div>

      {/* 3. Menu Content */}
      <div className="flex-1 overflow-y-auto px-[10px] py-3">
        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;

            return (
              <Link
                key={item.id}
                to={item.to}
                onClick={() => setActiveItem(item.id)}
                className={`group relative flex items-center gap-3 overflow-hidden rounded-xl border transition-all duration-200 no-underline ${
                  isCollapsed ? "justify-center p-3" : "px-3 py-[11px]"
                } ${
                  isActive
                    ? "border-indigo-500/35 bg-indigo-500/10"
                    : "border-transparent hover:border-white/[0.08] hover:bg-white/[0.05]"
                }`}
              >
                {isActive && (
                  <div
                    className="absolute left-0 top-[20%] bottom-[20%] w-[3px] rounded-r-[3px]"
                    style={{
                      background: "linear-gradient(180deg, #6366f1, #8b5cf6)",
                    }}
                  />
                )}
                <Icon
                  className={`h-[19px] w-[19px] flex-shrink-0 transition-colors duration-200 ${
                    isActive
                      ? "text-indigo-400"
                      : "text-slate-400/70 group-hover:text-slate-300"
                  }`}
                />
                {!isCollapsed && (
                  <span
                    className={`whitespace-nowrap text-[13.5px] font-semibold ${
                      isActive ? "text-indigo-200" : "text-slate-300/80"
                    }`}
                  >
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 4. Logout Button */}
      <div className="border-t border-white/[0.07] px-[10px] py-3">
        <button
          onClick={handleLogout}
          className={`group flex w-full cursor-pointer items-center gap-3 rounded-xl border border-transparent bg-transparent transition-all duration-200 hover:border-red-500/25 hover:bg-red-500/10 ${
            isCollapsed ? "justify-center p-[11px]" : "px-3 py-[11px]"
          }`}
        >
          <LogOut className="h-[19px] w-[19px] flex-shrink-0 text-red-400" />
          {!isCollapsed && (
            <span className="whitespace-nowrap text-[13.5px] font-semibold text-red-400">
              Logout
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default SidebarManager;
