import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";

const MiddleSectionSlider = () => {
  const slides = [
    {
      image:
        "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=1200",
      title: "Dashboard Admin",
      desc: "Theo dõi trạng thái bãi xe thời gian thực.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=1200",
      title: "Ứng dụng Mobile",
      desc: "Đặt chỗ và thanh toán nhanh bằng QR.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?auto=format&fit=crop&q=80&w=1200",
      title: "Camera AI",
      desc: "Nhận diện biển số tự động.",
    },
  ];

  return (
    <section className="py-5 px-4 bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">
          Hệ thống bãi đỗ xe thông minh
        </h2>

        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 3000 }}
          spaceBetween={20}
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div className="bg-zinc-900 rounded-xl overflow-hidden w-full h-full">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-[400px] object-cover"
                />

                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{slide.title}</h3>

                  <p className="text-sm text-gray-300">{slide.desc}</p>
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
