import { useState, useEffect } from 'react';
import { X, MessageCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const AvisoColores = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Verificar si ya fue cerrado previamente
        const avisoCerrado = localStorage.getItem('aviso_colores_cerrado');

        if (avisoCerrado) return;

        // Mostrar después de 3 segundos para no ser invasivo al cargar
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        // Guardar en localStorage para que no vuelva a aparecer
        localStorage.setItem('aviso_colores_cerrado', 'true');
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.9 }}
                    transition={{ duration: 0.5, type: 'spring' }}
                    className="fixed bottom-4 right-4 md:right-22 z-50 max-w-[320px] w-full"
                >
                    <div className="bg-black text-white p-5 rounded-2xl shadow-2xl border border-gray-800 relative overflow-hidden group">
                        {/* Glow effect */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#fff03b] opacity-10 blur-[50px] rounded-full pointer-events-none group-hover:opacity-20 transition-opacity duration-500"></div>

                        <button
                            onClick={handleClose}
                            className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
                            aria-label="Cerrar aviso"
                        >
                            <X size={18} />
                        </button>

                        <h4 className="font-bold text-[#fff03b] mb-1 text-lg flex items-center gap-2">
                            Colores Personalizados
                        </h4>

                        <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                            ¿Buscás un tono específico? Preparamos colores personalizados con tecnología de alta precisión.
                        </p>

                        <a
                            href="https://wa.me/5491125219626?text=Hola,%20me%20interesa%20saber%20m%C3%A1s%20sobre%20los%20colores%20personalizados."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full bg-[#fff03b] hover:bg-white text-black font-bold py-2.5 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02]"
                        >
                            <MessageCircle size={18} />
                            Consultar Ahora
                        </a>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AvisoColores;
