import "./App.css";
import { RouterProvider } from "react-router";
import router from "./routers/router.jsx";

function App() {
  return (
    <div className="min-h-svh h-full bg-primary">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
