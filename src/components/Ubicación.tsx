import { motion } from "framer-motion";
import { MapPin, Clock4, } from "lucide-react";

const fadeIn = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
};

const Ubicacion = () => {
  return (
    <section
      id="sucursal"
      className="scroll-mt-22 bg-gray-200 border-gray-300 border py-16 px-4 font-gotham"
    >
      <motion.div
        className="text-center mb-12"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
        variants={fadeIn}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-black uppercase tracking-wide">
          Nuestra sucursal
        </h2>
        <p className="mt-4 text-lg md:text-xl text-gray-800 max-w-4xl mx-auto leading-relaxed text-balance">
  Estamos en Estanislao López, Pilar (Zona Norte GBA), a pocas cuadras del centro.
  A la altura del km 50 de Panamericana (Ramal Pilar), Provincia de Buenos Aires.
</p>

      </motion.div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Mapa */}
        <motion.div
          className="w-full rounded-xl overflow-hidden shadow-lg"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          variants={fadeIn}
        >
          <iframe
            title="Mapa Briago Pinturas"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1310.879210701182!2d-58.91630896008887!3d-34.45420226150695!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bc9d01623f50b9%3A0x2a8291469c130fd9!2sBriago%20Pinturas%20S.A.!5e0!3m2!1ses-419!2sar!4v1720017307169!5m2!1ses-419!2sar"
            width="100%"
            height="100%"
            style={{ minHeight: "350px", border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </motion.div>

        {/* Información */}
        <motion.div
          className="w-full flex flex-col gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          variants={fadeIn}
        >
          <div className="flex items-center gap-3 bg-[#fff03b] text-black font-bold py-2 px-5 rounded-full shadow-md border border-black text-sm md:text-base w-fit">
            <MapPin className="w-5 h-5" />
            Retiro en el local
          </div>

          <p className="text-base md:text-lg text-gray-800 leading-relaxed">
            Podés avisarnos por{" "}
            <a
              href="https://wa.me/5491125219626"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 font-bold hover:underline inline-flex items-center gap-1"
            >
              WhatsApp
            </a>{" "}
            lo que vas a comprar y coordinar el retiro en persona en nuestra sucursal.
          </p>

          <div className="bg-gray-100 border border-gray-200 rounded-lg p-5 shadow-md">
            <h3 className="text-lg font-semibold text-black mb-3 flex items-center gap-2">
              <Clock4 className="w-5 h-5 text-yellow-600" />
              Horario de atención
            </h3>
            <p className="text-gray-700 leading-relaxed">
              <strong>Lunes a Viernes:</strong> 8:00 a 13:00 hs y de 14:00 a 18:00 hs.<br />
              <strong>Sábados:</strong> 8:00 a 13:00 hs.
            </p>
          </div>

          <a
  href="https://www.google.com/maps?q=Briago+Pinturas+S.A,+Estanislao+López+Pilar"
  target="_blank"
  rel="noopener noreferrer"
  className="inline-block bg-[#fff03b] shadow-md text-black font-bold py-2 px-6 rounded-full border border-black hover:bg-yellow-400 transition w-fit"
>
  Ver en Google Maps
</a>

        </motion.div>
      </div>
    </section>
  );
};

export default Ubicacion;
