
import { Link } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import { Check, ArrowRight, ShoppingBag } from 'lucide-react';

const CompraExitosaPage = () => {

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const iconVariants: Variants = {
    hidden: { scale: 0, rotate: -45 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay: 0.3
      }
    }
  };

  return (
    <div className="bg-white min-h-screen flex items-center justify-center p-4 font-gotham relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-[#fff03b]/20 rounded-full blur-3xl rounded-bl-full"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-gray-200/50 rounded-full blur-3xl rounded-tr-full"></div>
      </div>

      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="max-w-lg w-full bg-white p-10 sm:p-14 rounded-3xl shadow-2xl border border-gray-100 text-center relative z-10"
      >
        <div className="flex justify-center mb-8">
          <motion.div
            variants={iconVariants}
            className="w-24 h-24 bg-black rounded-full flex items-center justify-center shadow-lg shadow-black/20"
          >
            <Check className="w-12 h-12 text-[#fff03b]" strokeWidth={3} />
          </motion.div>
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-black uppercase tracking-tight mb-4">
          ¡Gracias!
        </h1>
        <h2 className="text-xl font-bold text-gray-500 uppercase tracking-widest mb-6">
          Compra Exitosa
        </h2>

        <p className="text-gray-600 mb-8 text-lg font-medium leading-relaxed">
          Tu pedido ha sido procesado correctamente. Hemos enviado un correo electrónico con los detalles de tu compra.
        </p>

        <div className="flex flex-col gap-4">
          <Link
            to="/"
            className="group w-full py-4 bg-[#fff03b] text-black font-black uppercase tracking-wider rounded-xl transition-all hover:bg-black hover:text-[#fff03b] shadow-lg flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Seguir Comprando</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/contactoubicacion"
            className="text-sm text-gray-400 font-bold uppercase hover:text-black transition-colors"
          >
            ¿Necesitás ayuda? Contáctanos
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default CompraExitosaPage;
