import parkingImg from "../../assets/pic/pic1.jpg";
export const Introduction = () => {
  return (
    <div className="flex min-h-screen items-center bg-slate-950 text-white px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center w-full">
        {/* LEFT CONTENT */}
        <div>
          <p className="text-sm text-blue-400 font-semibold mb-3">
            GIỚI THIỆU HỆ THỐNG
          </p>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Hệ thống <br />
            Quản lý Bãi đỗ xe Thông minh
          </h1>

          <p className="text-gray-300 mb-8 max-w-lg">
            Nền tảng hỗ trợ quản lý bãi đỗ xe hiện đại với khả năng giám sát
            phương tiện, quản lý vị trí đỗ và theo dõi hoạt động theo thời gian
            thực.
          </p>

          <div className="flex gap-4">
            <button className="bg-blue-600 px-6 py-3 rounded-lg font-semibold">
              Khám phá
            </button>

            <button className="border border-gray-600 px-6 py-3 rounded-lg">
              Xem Demo
            </button>
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div>
          <img
            src={parkingImg}
            alt="Parking System"
            className="w-full rounded-xl object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default Introduction;
