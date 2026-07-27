import { Building2, Leaf, Route, ParkingCircle } from "lucide-react";

import parkingImg from "../../assets/pic/pic3.jpg";

export const SystemOverview = () => {
  const features = [
    {
      icon: <Building2 size={24} />,
      title: "Multi-level parking optimization",
      desc: "Modern architecture that maximizes vertical space to increase parking capacity compared to traditional layouts.",
    },
    {
      icon: <Leaf size={24} />,
      title: "Green operations center",
      desc: "Facilities integrated with solar panels and urban greenery for energy efficiency and sustainability.",
    },
    {
      icon: <Route size={24} />,
      title: "AI traffic flow & guidance",
      desc: "Smart lanes, signage, and sensors guide vehicles in and out through dedicated routes to reduce congestion.",
    },
    {
      icon: <ParkingCircle size={24} />,
      title: "Smart surface parking",
      desc: "QR check-in, automatic license plate recognition, and real-time slot availability updates.",
    },
  ];

  return (
    <div className="bg-white py-16 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
            Explore the Full System
          </h2>

          <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed">
            A combination of automated management technology and smart urban
            infrastructure for a modern, efficient parking experience.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
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

          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-lg">
              <img
                src={parkingImg}
                alt="Parking system overview"
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
