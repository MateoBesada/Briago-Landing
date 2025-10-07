import { motion } from 'framer-motion';

import type { Transition } from 'framer-motion';

// Asegúrate de que la ruta a tu logo sea la correcta
import Logo from '/img/Otros/img-web-briago-ng12.png'; 

const LoadingScreen = () => {
  const brandName = "BRIAGO PINTURAS";

  const sentenceVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.5,
        staggerChildren: 0.08,
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };
  
  const circleTransition: Transition = {
    duration: 0.6,
    repeat: Infinity,
    repeatType: "reverse",
  };

  return (
    <motion.div
      key="loading-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8 } }}
      className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[100]"
    >
      {/* --- SE ELIMINÓ EL DIV WRAPPER ADICIONAL --- */}
      {/* Ahora los elementos son hijos directos del contenedor flex, asegurando un centrado perfecto */}
      
      <motion.img
        src={Logo}
        alt="Logo Briago Pinturas"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.8,
          ease: [0.6, 0.05, 0.01, 0.9],
        }}
        className="w-48 h-auto"
      />

      <motion.h2
        variants={sentenceVariants}
        initial="hidden"
        animate="visible"
        className="mt-6 text-lg font-semibold text-gray-700 tracking-[0.2em]"
      >
        {brandName.split("").map((char, index) => (
          <motion.span key={`${char}-${index}`} variants={letterVariants}>
            {char}
          </motion.span>
        ))}
      </motion.h2>
      
      <motion.div
        className="mt-4 flex justify-center items-center gap-4 h-6"
      >
        <motion.span
          variants={{ start: { y: "0%" }, end: { y: "100%" } }}
          initial="start"
          animate="end"
          transition={circleTransition}
          className="block w-4 h-4 bg-[#fff03b] rounded-full"
        />
        <motion.span
          variants={{ start: { y: "0%" }, end: { y: "100%" } }}
          initial="start"
          animate="end"
          transition={{...circleTransition, delay: 0.2}}
          className="block w-4 h-4 bg-gray-800 rounded-full"
        />
        <motion.span
          variants={{ start: { y: "0%" }, end: { y: "100%" } }}
          initial="start"
          animate="end"
          transition={{...circleTransition, delay: 0.4}}
          className="block w-4 h-4 bg-gray-400 rounded-full"
        />
      </motion.div>
    </motion.div>
  );
};

export default LoadingScreen;