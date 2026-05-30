import { Link } from "react-router";
import logo from "../../assets/pic/logo.png";
const Header = () => {
  return (
    <header className="fixed top-0 left-0 w-full z-50 border-b border-white/10 bg-slate-900/40">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 text-white  ">
        {/* LOGO */}
        <div className="flex items-center gap-2">
          <div className="rounded-2xl bg-white p-2">
            <img src={logo} alt="" className="w-15 h-15" />
          </div>

          <h1 className="text-xl font-bold tracking-wide">
            Parking Management
          </h1>
        </div>

        {/* NAV */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="/">Home</a>
          <a href="#">Features</a>
          <a href="#">Pricing</a>
          <a href="#">Contact</a>
        </nav>

        {/* BUTTON */}
        <div className="flex gap-3">
          <Link
            to="/login"
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-2 rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_20px_rgba(37,99,235,0.6)]"
          >
            Login
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
