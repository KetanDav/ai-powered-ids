import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./pages/App";
import About from "./pages/About";
import MapPanel from "./pages/MapPanel";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { IpProvider } from "./components/IpContext";
import "./index.css";

function Main() {
  return (
    <StrictMode>
      <IpProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/about" element={<About />} />
            <Route path="/map" element={<MapPanel />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </IpProvider>
    </StrictMode>
  );
}

createRoot(document.getElementById("root")).render(<Main />);
