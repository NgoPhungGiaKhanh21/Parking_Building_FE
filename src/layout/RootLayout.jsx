import { Outlet } from "react-router";
import { ToastContainer } from "react-toastify";

function RootLayout() {
  return (
    <div className="flex bg-primary flex-col min-h-svh">
      <div className="flex-1">
        <div className="">
          <div className="!z-2000 normalText">
            <ToastContainer
              newestOnTop
              pauseOnFocusLoss
              autoClose={3000}
              hideProgressBar
            />
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default RootLayout;
