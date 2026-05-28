import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar } from "antd";
import {
  Car,
  MapPin,
  Clock,
  CalendarDays,
  Receipt,
  LogOut,
  ChevronLeft,
  User,
  CarFront,
} from "lucide-react";

const SidebarDriver = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("my-vehicle");
  const navigate = useNavigate();

  const menuItems = [
    {
      id: "my-vehicle",
      label: "My Vehicle",
      icon: Car,
      to: "/driver",
    },
    {
      id: "availability",
      label: "Availability",
      icon: MapPin,
      to: "/driver/availability",
    },
    {
      id: "current-session",
      label: "Current Session",
      icon: Clock,
      to: "/driver/current-session",
    },
    {
      id: "reservation",
      label: "Reservation",
      icon: CalendarDays,
      to: "/driver/reservation",
    },
    {
      id: "payment-history",
      label: "Payment History",
      icon: Receipt,
      to: "/driver/payment-history",
    },
  ];

  const handleToggle = () => setIsCollapsed((prev) => !prev);

  const handleLogout = () => {
    const confirmed = window.confirm("Bạn có muốn đăng xuất khỏi hệ thống?");
    if (confirmed) {
      navigate("/");
    }
  };

  return (
    <div
      style={{
        width: isCollapsed ? "88px" : "280px",
        transition: "width 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        background: "linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        boxShadow: "4px 0 24px rgba(0,0,0,0.35)",
        position: "relative",
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        flexShrink: 0,
        overflow: "visible",
      }}
    >
      {/* Decorative top accent */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "3px",
        background: "linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)",
      }} />

      {/* 1. Header & Logo */}
      <div style={{
        padding: "20px 16px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        alignItems: "center",
        justifyContent: isCollapsed ? "center" : "flex-start",
        gap: "12px",
        minHeight: "76px",
        position: "relative",
      }}>
        <div style={{
          width: "44px", height: "44px",
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          borderRadius: "14px",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          boxShadow: "0 4px 15px rgba(99,102,241,0.5)",
        }}>
          <CarFront style={{ color: "white", width: "22px", height: "22px" }} />
        </div>

        {!isCollapsed && (
          <div style={{ overflow: "hidden" }}>
            <div style={{
              fontSize: "14px", fontWeight: 800, color: "#e2e8f0",
              lineHeight: 1.2, whiteSpace: "nowrap",
              letterSpacing: "-0.3px",
            }}>
              Parking Management
            </div>
            <div style={{
              fontSize: "11px", fontWeight: 600,
              background: "linear-gradient(90deg, #818cf8, #a78bfa)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              whiteSpace: "nowrap", letterSpacing: "0.5px",
            }}>
              Building
            </div>
          </div>
        )}

        {/* Toggle Button */}
        <button
          onClick={handleToggle}
          title={isCollapsed ? "Mở rộng" : "Thu gọn"}
          style={{
            position: "absolute",
            right: "-16px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "32px", height: "32px",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            border: "2px solid #1e293b",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 0 0 3px rgba(99,102,241,0.25), 0 4px 12px rgba(0,0,0,0.4)",
            zIndex: 20,
            transition: "all 0.2s ease",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "linear-gradient(135deg, #4f46e5, #7c3aed)";
            e.currentTarget.style.boxShadow = "0 0 0 4px rgba(99,102,241,0.35), 0 4px 16px rgba(0,0,0,0.5)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "linear-gradient(135deg, #6366f1, #8b5cf6)";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.25), 0 4px 12px rgba(0,0,0,0.4)";
          }}
        >
          <ChevronLeft style={{
            color: "white",
            width: "15px", height: "15px",
            transform: isCollapsed ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          }} />
        </button>
      </div>

      {/* 2. User Avatar & Role Info */}
      <div style={{
        padding: isCollapsed ? "16px 8px" : "20px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
        background: "rgba(255,255,255,0.02)",
      }}>
        <div style={{ position: "relative" }}>
          <div style={{
            padding: "3px",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            borderRadius: "50%",
          }}>
            <Avatar
              size={isCollapsed ? 44 : 68}
              icon={<User />}
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Driver"
              style={{ display: "block", border: "2px solid #0f172a" }}
            />
          </div>
          <div style={{
            position: "absolute", bottom: "2px", right: "2px",
            width: "12px", height: "12px",
            background: "#22c55e",
            border: "2px solid #0f172a",
            borderRadius: "50%",
          }} />
        </div>

        {!isCollapsed && (
          <div style={{ textAlign: "center", width: "100%", overflow: "hidden" }}>
            <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#f1f5f9", margin: 0, marginBottom: "6px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Ngô Phùng Gia Khánh
            </h2>
            <span style={{
              display: "inline-block",
              padding: "3px 12px",
              background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))",
              border: "1px solid rgba(99,102,241,0.4)",
              borderRadius: "999px",
              fontSize: "10px", fontWeight: 700,
              color: "#a5b4fc",
              letterSpacing: "1px", textTransform: "uppercase",
            }}>
              Driver
            </span>
          </div>
        )}
      </div>

      {/* 3. Menu Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 10px" }}>
        {!isCollapsed && (
          <div style={{
            fontSize: "10px", fontWeight: 700, color: "rgba(148,163,184,0.6)",
            textTransform: "uppercase", letterSpacing: "1.5px",
            marginBottom: "10px", paddingLeft: "8px",
          }}>
          </div>
        )}

        <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;

            return (
              <Link
                key={item.id}
                to={item.to}
                onClick={() => setActiveItem(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: isCollapsed ? "12px" : "11px 12px",
                  borderRadius: "12px",
                  textDecoration: "none",
                  justifyContent: isCollapsed ? "center" : "flex-start",
                  background: isActive
                    ? "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.2))"
                    : "transparent",
                  border: isActive
                    ? "1px solid rgba(99,102,241,0.35)"
                    : "1px solid transparent",
                  transition: "all 0.2s ease",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)";
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.border = "1px solid transparent";
                  }
                }}
              >
                {isActive && (
                  <div style={{
                    position: "absolute", left: 0, top: "20%", bottom: "20%",
                    width: "3px", background: "linear-gradient(180deg, #6366f1, #8b5cf6)",
                    borderRadius: "0 3px 3px 0",
                  }} />
                )}
                <Icon style={{
                  width: "19px", height: "19px", flexShrink: 0,
                  color: isActive ? "#818cf8" : "rgba(148,163,184,0.7)",
                  transition: "color 0.2s",
                }} />
                {!isCollapsed && (
                  <span style={{
                    fontSize: "13.5px", fontWeight: 600,
                    color: isActive ? "#c7d2fe" : "rgba(203,213,225,0.8)",
                    whiteSpace: "nowrap",
                  }}>
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 4. Logout Button */}
      <div style={{
        padding: "12px 10px",
        borderTop: "1px solid rgba(255,255,255,0.07)",
      }}>
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            display: "flex", alignItems: "center", gap: "12px",
            padding: isCollapsed ? "11px" : "11px 12px",
            borderRadius: "12px",
            background: "transparent",
            border: "1px solid transparent",
            cursor: "pointer",
            justifyContent: isCollapsed ? "center" : "flex-start",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(239,68,68,0.12)";
            e.currentTarget.style.border = "1px solid rgba(239,68,68,0.25)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.border = "1px solid transparent";
          }}
        >
          <LogOut style={{ width: "19px", height: "19px", color: "#f87171", flexShrink: 0 }} />
          {!isCollapsed && (
            <span style={{ fontSize: "13.5px", fontWeight: 600, color: "#f87171", whiteSpace: "nowrap" }}>
              Logout
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default SidebarDriver;
