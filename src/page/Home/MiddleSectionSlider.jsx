import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import img1 from "../../assets/pic/pic5.jpg";
import img2 from "../../assets/pic/pic6.png";

import "swiper/css";

const MiddleSectionSlider = () => {
  const slides = [
    {
      image: img1,
      title: "Quản lý bãi xe thông minh",
      desc: "Theo dõi vị trí đỗ xe, số lượng chỗ trống và trạng thái phương tiện theo thời gian thực.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=1200",
      title: "Đặt chỗ & thanh toán",
      desc: "Hỗ trợ đặt chỗ trước và thanh toán nhanh chóng bằng mã QR tiện lợi.",
    },
    {
      image: img2,
      title: "Giám sát phương tiện",
      desc: "Kiểm soát lượt xe ra vào, lưu lịch sử gửi xe và hỗ trợ quản lý an toàn hiệu quả.",
    },
  ];

  return (
    <section className="w-full min-h-screen bg-white pt-28">
      {/* pt-28 để tránh bị header che */}

      <div className="w-full">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-slate-900">
          Hệ thống bãi đỗ xe thông minh
        </h2>

        <p className="text-center text-slate-500 mb-10 text-lg max-w-3xl mx-auto px-4">
          Giải pháp quản lý bãi xe hiện đại giúp tối ưu vận hành và nâng cao
          trải nghiệm người dùng.
        </p>

        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 3000 }}
          spaceBetween={0}
          loop={true}
          className="w-full"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div className="relative w-full h-[80vh] overflow-hidden">
                {/* IMAGE */}
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />

                {/* OVERLAY */}
                <div className="absolute inset-0 bg-black/40" />

                {/* CONTENT */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                  <h3 className="text-4xl md:text-6xl font-bold text-white mb-6">
                    {slide.title}
                  </h3>

                  <p className="text-white/80 text-lg md:text-xl max-w-3xl leading-8">
                    {slide.desc}
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default MiddleSectionSlider;
