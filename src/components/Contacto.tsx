import { FaWhatsapp, FaInstagram } from "react-icons/fa";
import { CgMail } from "react-icons/cg";
import { motion } from "framer-motion";

const Contacto = () => {
  return (
    <section id="contacto" className="scroll-mt-22 bg-white py-20 px-4 font-gotham text-center">
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, amount: 0.3 }}
        className="text-3xl md:text-4xl font-bold text-black uppercase tracking-wide"
      >
        Contactanos
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        viewport={{ once: true, amount: 0.3 }}
        className="text-lg md:text-xl text-gray-800 font-medium mt-4 mb-16 max-w-2xl mx-auto leading-relaxed"
      >
        Nuestro equipo está listo para ayudarte.{" "}
        <br className="hidden sm:block" />
        Dejanos tu consulta y te responderemos a la brevedad.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        viewport={{ once: true, amount: 0.3 }}
        className="flex flex-col md:flex-row justify-center items-center gap-12 md:gap-24"
      >
        {/* Instagram */}
        <a
          href="https://www.instagram.com/briagopinturas"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center group hover:scale-105 transition-transform duration-300"
        >
          <div className="bg-black text-yellow-300 p-4 rounded-full shadow-lg group-hover:bg-[#E1306C] group-hover:text-white transition-colors duration-300">
            <FaInstagram size={28} />
          </div>
          <p className="text-black text-md font-semibold mt-3 group-hover:text-[#E1306C] transition-colors">
            @briagopinturas
          </p>
        </a>

        {/* Email */}
        <a
          href="mailto:briagopinturas@gmail.com"
          className="flex flex-col items-center group hover:scale-105 transition-transform duration-300"
        >
          <div className="bg-black text-yellow-300 p-4 rounded-full shadow-lg group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
            <CgMail size={28} />
          </div>
          <p className="text-black text-md font-semibold mt-3 group-hover:text-blue-500 transition-colors">
            briagopinturas@gmail.com
          </p>
        </a>

        {/* WhatsApp */}
        <a
          href="https://wa.me/5491125219626"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center group hover:scale-105 transition-transform duration-300"
        >
          <div className="bg-black text-yellow-300 p-4 rounded-full shadow-lg group-hover:bg-green-500 group-hover:text-white transition-colors duration-300">
            <FaWhatsapp size={28} />
          </div>
          <p className="text-black text-md font-semibold mt-3 group-hover:text-green-500 transition-colors">
            +54 9 11 2521-9626
          </p>
        </a>
      </motion.div>
    </section>
  );
};

export default Contacto;
