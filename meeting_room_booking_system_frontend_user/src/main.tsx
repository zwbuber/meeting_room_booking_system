import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/index.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
  //   <App />
  // </React.StrictMode>,
  <RouterProvider router={router} />
);
