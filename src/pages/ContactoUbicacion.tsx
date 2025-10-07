const Contacto = () => {
  return (
    <div className="w-full bg-gray-100 text-black">
      <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-4">
        {/* INFORMACIÓN A LA IZQUIERDA dividida en 3 mini cajas */}
        <div className="w-full md:w-1/3 bg-white border border-black rounded-xl h-[800px] flex flex-col divide-y divide-black overflow-hidden">
          {/* Dónde estamos */}
          <div className="flex-1 flex flex-col justify-center items-center text-center px-4">
            <h2 className="text-xl font-bold mb-2">Dónde estamos</h2>
            <p>Estanislao López 737</p>
            <p>Pilar, (Zona Norte GBA)</p>
            <p>Argentina</p>
          </div>

          {/* Horarios de atención */}
          <div className="flex-1 flex flex-col justify-center items-center text-center px-4">
            <h2 className="text-xl font-bold mb-2">Horarios de atención</h2>
            <p>
              <strong>Lunes a Viernes:</strong> 8:00 a 13:00 hs y de 14:00 a 18:00 hs.
            </p>
            <p>
              <strong>Sábados:</strong> 8:00 a 13:00 hs.
            </p>
          </div>

          {/* Contacto */}
          <div className="flex-1 flex flex-col justify-center items-center text-center px-4">
            <h2 className="text-xl font-bold mb-2">Contacto</h2>
            <p>
              WhatsApp:{" "}
              <a
                href="https://wa.me/5491125219626"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-green-500 transition duration-300"
              >
                +54 9 11 2521-9626
              </a>
            </p>
            <p>
              Email:{" "}
              <a
                href="mailto:briagopinturas@gmail.com"
                className="hover:text-blue-400 transition duration-300"
              >
                briagopinturas@gmail.com
              </a>
            </p>
            <p>
              Instagram:{" "}
              <a
                href="https://www.instagram.com/briagopinturas"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-violet-600 transition duration-300"
              >
                @briagopinturas
              </a>
            </p>
          </div>
        </div>

        {/* MAPA A LA DERECHA */}
        <div className="w-full md:w-2/3 border h-100 md:h-[800px] border-black rounded-xl overflow-hidden max-h-[800px]">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3289.9164837972226!2d-58.91794322447203!3d-34.45426784962037!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bc9d01623f50b9%3A0x2a8291469c130fd9!2sBriago%20Pinturas%20S.A!5e0!3m2!1ses-419!2sar!4v1754507925453!5m2!1ses-419!2sar"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default Contacto;
