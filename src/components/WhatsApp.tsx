import { FaWhatsapp } from 'react-icons/fa';

const BotonWhatsappFlotante = () => {
  return (
    <a
      href="https://wa.me/5491125219626"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition transform hover:scale-105"
      aria-label="Chatear por WhatsApp"
    >
      <FaWhatsapp size={28} />
    </a>
  );
};

export default BotonWhatsappFlotante;
