import { useEffect } from "react";
import { CheckCircle } from "lucide-react";

interface CartelCarritoProps {
  visible: boolean;
  onClose: () => void;
  mensaje: string;
}

const CartelCarrito = ({ visible, onClose, mensaje }: CartelCarritoProps) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onClose, 3000); // se oculta luego de 3 segundos
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed top-16 right-6 z-50 bg-black text-white px-4 py-3 rounded-lg shadow-lg border border-yellow-400 flex items-center gap-2 animate-fade-in-up">
      <CheckCircle className="text-green-400" size={20} />
      <span className="text-sm">{mensaje}</span>
    </div>  
  );
};

export default CartelCarrito;
