import { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";

const CartelWhatsApp = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 7500);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-5 right-22 sm:right-22 z-50 bg-green-500 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-3 border border-green-700 font-gotham-book animate-cartel-in">
      <FaWhatsapp className="text-green-100 text-xl animate-bounce-slow" />
      <span className="text-sm sm:text-base">
        ¡Háblenos por algún producto!
      </span>
    </div>
  );
};

export default CartelWhatsApp;
