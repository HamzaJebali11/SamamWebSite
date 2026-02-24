import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import HomePage from "./pages/HomePage";
import DronePage from "./pages/DronePage";
import AboutPage from "./pages/AboutPage";

import "./global.css";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/services/drones" element={<DronePage />} />
          <Route path="/about" element={<AboutPage />} />

          {/* <Route path="/services" element={<ServicesPage />} /> */}
          {/* <Route path="/about" element={<AboutPage />} /> */}
          {/* <Route path="/contact" element={<ContactPage />} /> */}
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}