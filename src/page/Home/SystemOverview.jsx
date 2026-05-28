import { Building2, Leaf, Route, ParkingCircle } from "lucide-react";

import parkingImg from "../../assets/pic/pic3.jpg";

export const SystemOverview = () => {
  const features = [
    {
      icon: <Building2 size={24} />,
      title: "Nhà xe nhiều tầng tối ưu",
      desc: "Mô hình kiến trúc hiện đại, tận dụng tối đa không gian chiều cao để tăng X3 hiệu suất chứa xe so với mặt bằng truyền thống.",
    },
    {
      icon: <Leaf size={24} />,
      title: "Trung tâm điều hành Xanh",
      desc: "Tòa nhà vận hành tích hợp pin mặt trời và mảng xanh đô thị, tối ưu năng lượng và thân thiện với môi trường.",
    },
    {
      icon: <Route size={24} />,
      title: "Phân luồng & Điều hướng AI",
      desc: "Hệ thống vạch kẻ, mũi tên và cảm biến thông minh chỉ dẫn xe ra vào theo làn riêng biệt, xóa sổ hoàn toàn tình trạng ùn tắc.",
    },
    {
      icon: <ParkingCircle size={24} />,
      title: "Bãi đỗ mặt đất thông minh",
      desc: "Khu vực quét mã, nhận diện biển số tự động và cập nhật trạng thái vị trí trống theo thời gian thực (Real-time).",
    },
  ];

  return (
    <div className="bg-white py-16 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* TIÊU ĐỀ */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
            Khám Phá Toàn Cảnh Hệ Thống
          </h2>

          <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Sự kết hợp giữa công nghệ quản lý tự động và hạ tầng đô thị thông
            minh, mang lại trải nghiệm đỗ xe hiện đại và tối ưu.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* LEFT CONTENT */}
          <div className="lg:col-span-5 grid gap-4 order-2 lg:order-1">
            {features.map((item, index) => (
              <div
                key={index}
                className="border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-all duration-300 bg-white"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-slate-100 text-slate-700 shrink-0">
                    {item.icon}
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-lg mb-2">
                      {item.title}
                    </h3>

                    <p className="text-slate-500 text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* IMAGE */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-lg">
              <img
                src={parkingImg}
                alt="Mô hình tổng quan bãi đỗ xe"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemOverview;
