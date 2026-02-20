import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/index.css";
import setupAxiosInterceptors from "./services/axiosInterceptor";

setupAxiosInterceptors();

createRoot(document.getElementById("root")).render(<App />);
