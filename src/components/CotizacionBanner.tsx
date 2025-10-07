import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import CotizacionVideo from "../img/video/ColoresPersonalizados.mp4";

function CotizacionBanner() {
  const [visible, setVisible] = useState(true);

  const toggleVisible = () => {
    setVisible(!visible);
  };

  const abrirWhatsApp = () => {
    const numero = "5491125219626";
    window.open(`https://wa.me/${numero}`, "_blank");
  };

  return (
    <div
      className={`fixed bottom-0 left-0 m-4 transition-transform duration-300 z-50 ${
        visible ? "translate-y-0" : "translate-y-[103%]"
      }`}
    >
      {/* Botón de alternar */}
      <button
        onClick={toggleVisible}
        className="absolute -top-8 right-0 bg-black/80 text-white px-2 py-1 rounded-t shadow hover:bg-black transition"
      >
        {visible ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
      </button>

      {/* Video clickeable */}
      <div
        onClick={abrirWhatsApp}
        className="relative w-[220px] h-[260px] sm:w-[350px] sm:h-[400px] 
        border-t-4 border-black shadow-lg overflow-hidden 
        rounded cursor-pointer"
      >
        <video
          src={CotizacionVideo}
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        />
      </div>
    </div>
  );
}

export default CotizacionBanner;
