import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import img1 from "../../assets/pic/pic5.jpg";
import img2 from "../../assets/pic/pic6.png";

import "swiper/css";

const MiddleSectionSlider = () => {
  const slides = [
    {
      image: img1,
      title: "Smart parking management",
      desc: "Track parking slots, available spaces, and vehicle status in real time.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=1200",
      title: "Reservations & payments",
      desc: "Support advance booking and fast QR-based payments for a seamless experience.",
    },
    {
      image: img2,
      title: "Vehicle monitoring",
      desc: "Control entry and exit, keep parking history, and manage security efficiently.",
    },
  ];

  return (
    <section className="w-full min-h-screen bg-white pt-28">
      <div className="w-full">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-slate-900">
          Smart Parking System
        </h2>

        <p className="text-center text-slate-500 mb-10 text-lg max-w-3xl mx-auto px-4">
          A modern parking solution that optimizes operations and improves the
          user experience.
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
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-black/40" />

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
