import { CarFront, Mail, MapPin, Phone } from "lucide-react";

import { FaFacebookF, FaInstagram, FaGithub } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-white pt-16 pb-8 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 border-b border-white/10 pb-12">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-blue-500 p-2 rounded-xl">
                <CarFront size={22} />
              </div>

              <h2 className="text-2xl font-bold">Smart Parking</h2>
            </div>

            <p className="text-slate-400 leading-7">
              A smart parking management platform that optimizes operations,
              improves user experience, and supports modern facility management.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-5">Navigation</h3>

            <ul className="space-y-3 text-slate-400">
              <li className="hover:text-white transition cursor-pointer">
                Home
              </li>

              <li className="hover:text-white transition cursor-pointer">
                About
              </li>

              <li className="hover:text-white transition cursor-pointer">
                Features
              </li>

              <li className="hover:text-white transition cursor-pointer">
                Contact
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-5">Features</h3>

            <ul className="space-y-3 text-slate-400">
              <li>Slot management</li>
              <li>QR payments</li>
              <li>License plate recognition</li>
              <li>Real-time monitoring</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-5">Contact</h3>

            <div className="space-y-4 text-slate-400">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="mt-1" />

                <p>Ho Chi Minh City, Vietnam</p>
              </div>

              <div className="flex items-center gap-3">
                <Phone size={18} />

                <p>+84 123 456 789</p>
              </div>

              <div className="flex items-center gap-3">
                <Mail size={18} />

                <p>smartparking@gmail.com</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 gap-5">
          <p className="text-slate-500 text-sm text-center md:text-left">
            © 2025 Smart Parking System. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-3 rounded-full hover:bg-blue-500 transition duration-300 cursor-pointer">
              <FaFacebookF size={18} />
            </div>

            <div className="bg-white/10 p-3 rounded-full hover:bg-pink-500 transition duration-300 cursor-pointer">
              <FaInstagram size={18} />
            </div>

            <div className="bg-white/10 p-3 rounded-full hover:bg-slate-700 transition duration-300 cursor-pointer">
              <FaGithub size={18} />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
