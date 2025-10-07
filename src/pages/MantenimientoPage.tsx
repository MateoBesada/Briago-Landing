
// Asegúrate de que la ruta a tu logo sea correcta
import logo from '../img/Captura_de_pantalla_2025-05-30_100255-removebg-preview.png';

// Un ícono simple de WhatsApp para el nuevo botón de contacto
const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.487 5.235 3.487 8.413.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.956-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.273-.099-.471-.148-.67.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.67-1.611-.916-2.206-.242-.579-.487-.5-.669-.508-.182-.008-.381-.008-.579-.008-.198 0-.522.074-.795.372-.273.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.203 5.076 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
  </svg>
);

const MantenimientoPage = () => {
  return (
    <div className="bg-gray-100 flex items-center justify-center min-h-screen font-gotham">
      <div className="text-center p-8 max-w-lg mx-auto bg-white rounded-xl shadow-2xl">
        <img
          src={logo}
          alt="Logo de Briago Pinturas"
          className="h-28 mx-auto mb-10" // Logo más grande
        />
        <h1 className="text-4xl font-bold text-gray-800 mt-6">
          Sitio en Mantenimiento
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Nuestra tienda online se está actualizando para brindarte una mejor experiencia.
        </p>
        <p className="mt-2 text-gray-600">
          Volveremos a estar activos muy pronto. ¡Gracias por tu paciencia!
        </p>
        {/* Nuevo bloque de contacto por WhatsApp */}
        <div className="mt-10 border-t pt-6">
          <p className="text-sm text-gray-500 mb-4">
            ¿Tenés una consulta urgente?
          </p>
          <a 
            href="https://wa.me/5491125219626"
            target="_blank" // Abre en una nueva pestaña
            rel="noopener noreferrer" // Buenas prácticas de seguridad
            className="inline-flex items-center justify-center px-6 py-3 bg-green-500 text-white font-bold rounded-full shadow-lg transition-transform duration-300 hover:scale-105"
          >
            <WhatsAppIcon />
            Contactanos por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

export default MantenimientoPage;