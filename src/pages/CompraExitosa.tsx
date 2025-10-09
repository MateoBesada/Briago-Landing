
import { Link } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';

// --- COMPONENTES DE UI ---

// El ícono de check animado sigue siendo un excelente indicador visual.
const AnimatedCheckIcon = () => (
  <svg className="w-20 h-20 text-green-500 mx-auto" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <motion.path
      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    />
    <motion.path
      d="M7.75 12.001L10.58 14.831L16.25 9.16998"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut", delay: 0.5 }}
    />
  </svg>
);


// --- COMPONENTE PRINCIPAL (SIMPLIFICADO) ---
// Se han eliminado los estados, useEffect y el resumen del pedido.
const CompraExitosaPage = () => {
  
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.6, 
        ease: "easeOut"
      } 
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen flex items-center justify-center p-4 font-gotham">
      <motion.div 
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md w-full bg-white p-8 sm:p-12 rounded-2xl shadow-xl text-center"
      >
        <AnimatedCheckIcon />
        <h1 className="text-4xl font-extrabold text-slate-900 mt-6">¡Gracias por tu compra!</h1>
        <p className="text-slate-600 mt-3 text-lg">
          Hemos recibido tu pedido y ya lo estamos preparando.
        </p>
        
        <Link 
          to="/"
          className="inline-block mt-8 px-10 py-3 bg-slate-900 text-white font-bold rounded-full hover:bg-slate-700 transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-50"
        >
          Volver al Inicio
        </Link>
      </motion.div>
    </div>
  );
};

export default CompraExitosaPage;