import { useState } from 'react';
import { MapPin } from 'lucide-react';

const UbicacionFlotante = () => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="fixed bottom-21 right-4 z-50">
      <button
        onClick={() => setVisible(!visible)}
        className="bg-yellow-300 hover:bg-yellow-500 text-black p-4 rounded-full shadow-lg transition-all hover:scale-105"
        title="Ver ubicación"
      >
        <MapPin size={28} />
      </button>

      {visible && (
        <div
          className="absolute bottom-20 right-0 bg-white border border-gray-300 rounded-2xl shadow-xl p-4"
          style={{ width: '340px' }}
        >
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold font-gotham">Nuestra Ubicación</h2>
            <button
              onClick={() => setVisible(false)}
              className="text-gray-600 hover:text-black text-3xl"
              title="Cerrar"
            >
              ×
            </button>
          </div>
          <p className="text-md text-gray-800 mb-3 font-gotham">
            Estanislao López 737, Pilar, Buenos Aires
          </p>
          <div className="rounded-lg overflow-hidden" style={{ width: '100%', height: '250px' }}>
            <iframe
              title="Mapa de ubicación"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1310.879210701182!2d-58.91630896008887!3d-34.45420226150695!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bc9d01623f50b9%3A0x2a8291469c130fd9!2sBriago%20Pinturas%20S.A.!5e0!3m2!1ses-419!2sar!4v1720017307169!5m2!1ses-419!2sar"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default UbicacionFlotante;