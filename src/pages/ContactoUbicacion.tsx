import React, { useState } from 'react';
import { MapPin, Clock, Mail, Instagram, Send, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const Contacto = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    asunto: '',
    mensaje: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { nombre, email, asunto, mensaje } = formData;

    // Gmail Compose URL
    const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=briagopinturas@gmail.com&su=${encodeURIComponent(asunto)}&body=${encodeURIComponent(`Nombre: ${nombre}\nEmail: ${email}\n\nMensaje:\n${mensaje}`)}`;

    window.open(gmailLink, '_blank');
  };

  return (
    <div className="w-full bg-white text-black min-h-screen">
      {/* Hero Section */}
      <div className="bg-[#fff03b] py-16 md:py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-4 text-black"
          >
            CONTACTO
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl font-medium text-black/80 max-w-2xl mx-auto"
          >
            Estamos aquí para asesorarte. Visítanos o escríbenos.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

          {/* Columna Izquierda: Información */}
          <div className="lg:col-span-1 space-y-8">
            {/* Tarjeta de Ubicación */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-black text-[#fff03b] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <MapPin size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Ubicación</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Estanislao López 737<br />
                Pilar, Zona Norte GBA<br />
                Argentina
              </p>
            </motion.div>

            {/* Tarjeta de Horarios */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-black text-[#fff03b] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Clock size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Horarios</h3>
              <div className="space-y-3 text-gray-900 text-lg">
                <div className="flex flex-col sm:flex-row sm:justify-between border-b border-gray-200 pb-2">
                  <span className="font-bold">Lunes a Viernes</span>
                  <span className="font-medium text-gray-700">8:00 - 13:00 / 14:00 - 18:00</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between pt-1">
                  <span className="font-bold">Sábados</span>
                  <span className="font-medium text-gray-700">8:00 - 13:00</span>
                </div>
              </div>
            </motion.div>

            {/* Tarjeta de Contacto Directo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-black text-white p-8 rounded-3xl hover:shadow-xl transition-all duration-300"
            >
              <h3 className="text-2xl font-bold mb-6 text-[#fff03b]">Canales Directos</h3>
              <div className="space-y-6">
                <a href="https://wa.me/5491125219626" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                  <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-[#25D366] group-hover:text-white transition-colors">
                    <MessageSquare size={20} />
                  </div>
                  <span className="text-lg font-medium group-hover:text-[#fff03b] transition-colors">+54 9 11 2521-9626</span>
                </a>

                <a href="mailto:briagopinturas@gmail.com" className="flex items-center gap-4 group">
                  <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <Mail size={20} />
                  </div>
                  <span className="text-lg font-medium group-hover:text-[#fff03b] transition-colors">briagopinturas@gmail.com</span>
                </a>

                <a href="https://www.instagram.com/briagopinturas" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                  <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-pink-600 group-hover:text-white transition-colors">
                    <Instagram size={20} />
                  </div>
                  <span className="text-lg font-medium group-hover:text-[#fff03b] transition-colors">@briagopinturas</span>
                </a>
              </div>
            </motion.div>
          </div>

          {/* Columna Derecha: Mapa y Formulario */}
          <div className="lg:col-span-2 space-y-8">

            {/* Mapa */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="w-full h-[400px] bg-gray-200 rounded-3xl overflow-hidden shadow-lg border border-gray-100"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3289.9164837972226!2d-58.91794322447203!3d-34.45426784962037!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bc9d01623f50b9%3A0x2a8291469c130fd9!2sBriago%20Pinturas%20S.A!5e0!3m2!1ses-419!2sar!4v1754507925453!5m2!1ses-419!2sar"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                className="lg:grayscale lg:hover:grayscale-0 transition-all duration-500"
              ></iframe>
            </motion.div>

            {/* Formulario de Contacto (Visual) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100"
            >
              <h3 className="text-3xl font-bold mb-2">Envíanos un mensaje</h3>
              <p className="text-gray-500 mb-8">Te responderemos a la brevedad.</p>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-900 uppercase tracking-wide">Nombre</label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                      placeholder="Tu nombre"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-900 uppercase tracking-wide">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900 uppercase tracking-wide">Asunto</label>
                  <input
                    type="text"
                    name="asunto"
                    value={formData.asunto}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                    placeholder="Consulta sobre..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900 uppercase tracking-wide">Mensaje</label>
                  <textarea
                    rows={4}
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all resize-none"
                    placeholder="Escribe tu mensaje aquí..."
                    required
                  ></textarea>
                </div>

                <button type="submit" className="w-full bg-[#fff03b] text-black font-extrabold py-4 rounded-xl hover:bg-black hover:text-white transition-all duration-300 flex items-center justify-center gap-2 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  ENVIAR MENSAJE
                  <Send size={20} />
                </button>
              </form>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Contacto;
