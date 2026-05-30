import parkingImg from "../../assets/pic/pic1.jpg";

export const Introduction = () => {
  return (
    <div className="flex min-h-screen items-center bg-[##FFFFFF] text-slate-900 px-6 font-sans">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center w-full">
        {/* LEFT CONTENT */}
        <div>
          <p className="text-xl text-blue-600 font-semibold mb-3 ">
            GIỚI THIỆU HỆ THỐNG
          </p>

          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
            Hệ Thống Quản Lý <br />
            Bãi Đỗ Xe Thông Minh
          </h1>

          <p className="text-slate-600 mb-8 max-w-lg">
            Nền tảng hỗ trợ quản lý bãi đỗ xe hiện đại với khả năng giám sát
            phương tiện, quản lý vị trí đỗ và theo dõi hoạt động theo thời gian
            thực.
          </p>

          <div className="flex gap-4">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Khám phá
            </button>
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div>
          <img
            src={parkingImg}
            alt="Parking System"
            className="w-full rounded-xl object-cover shadow-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default Introduction;
