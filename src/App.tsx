import { useEffect, useState } from "react";
import { useLocation, Routes, Route } from "react-router-dom";

import HeaderInicio from "./components/Header";
import Secciones from "./components/Secciones";
import WhatsApp from "./components/WhatsApp";
import UbicaciónFlotante from "./components/UbicaciónFlotante";
import ProductosPage from "./pages/Productos-pinturas";
import AutomotorPage from "./pages/Productos-automotor";
import IndustriaPage from "./pages/Productos-industria";
import AbrasivosPage from "./pages/Productos-abrasivos";
import AccesoriosPage from "./pages/Productos-accesorios";
import ProductosTotal from "./pages/ProductosTotal";
import Buscar from "./components/Buscar";
import Footer from "./components/Footer";
import CartelWhatsApp from "./components/CartelFlotante";
import BannerOficial from "./components/BannerOficial";
import Marcas from "./components/SectorMarcas";
import Ubicación from "./components/Ubicación";
import Contacto from "./components/Contacto";
import Colores from "./components/ColoresSection";
import Carrito from "@/pages/Carrito";
import CheckoutPage from "./pages/Checkout";
import ProductoPage from "./pages/ProductPage";
import TerminosYCondiciones from "@/pages/Terminos";
import SobreBriago from "@/pages/SobreBriago";
import ProductosDesdeDB from "./pages/Productos";

import "swiper";

function HomePageWrapper() {
  const location = useLocation();

  useEffect(() => {
    const id = location.state?.scrollTo;
    if (id) {
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 0);
      }
    }
  }, [location]);

  return (
    <>
      <BannerOficial />
      <Secciones />
      <ProductosTotal />
      <Colores />
      <Ubicación />
      <Contacto />
      <Marcas />
    </>
  );
}

function App() {
  const location = useLocation();
  const [] = useState(false);

  useEffect(() => {
    const manejarScroll = () => (window.scrollY > 80);
    window.addEventListener("scroll", manejarScroll);
    return () => window.removeEventListener("scroll", manejarScroll);
  }, []);

  const ocultarFooterEn = [
    "/productos-pinturas",
    "/productos-automotor",
    "/productos-accesorios",
    "/productos-abrasivos",
    "/productos-db",
  ];
  const mostrarFooter = !ocultarFooterEn.includes(location.pathname);

  return (
    <div className="font-gotham text-gray-800 bg-white">

      <div className="sticky top-0 z-50">
        <HeaderInicio />
      </div>

      <WhatsApp />
      <UbicaciónFlotante />
      <CartelWhatsApp />

      <div className="pt-20 md:pt-20 min-h-screen">
        <Routes>
          <Route path="/" element={<HomePageWrapper />} />
          <Route path="/productos-pinturas" element={<ProductosPage />} />
          <Route path="/productos-automotor" element={<AutomotorPage />} />
          <Route path="/productos-industria" element={<IndustriaPage />} />
          <Route path="/productos-abrasivos" element={<AbrasivosPage />} />
          <Route path="/productos-accesorios" element={<AccesoriosPage />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/buscar" element={<Buscar />} />
          <Route path="/producto/:id" element={<ProductoPage />} />
          <Route path="/terminos" element={<TerminosYCondiciones />} />
          <Route path="/sobreBriago" element={<SobreBriago />} />
          <Route path="/productos-db" element={<ProductosDesdeDB />} />
        </Routes>
      </div>

      {mostrarFooter && <Footer />}
    </div>
  );
}

export default App;
