import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App.jsx";
import "./index.css";
import store, { persistor } from "./redux/store"; // THÊM: import persistor
import { PersistGate } from "redux-persist/integration/react"; // THÊM: PersistGate

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>,
);
