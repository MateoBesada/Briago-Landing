import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const formatearPrecio = (precio: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(precio);

const CartPanel = () => {
  const { isSidebarOpen, toggleSidebar, cart, quitarDelCarrito, cambiarCantidad } = useCart();

  const total = cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          {/* Fondo Oscuro (Backdrop) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 bg-black/60 z-50"
          />

          {/* Panel del Carrito */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: "0%" }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", ease: "easeInOut", duration: 0.4 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">Tu Carrito</h2>
              <button onClick={toggleSidebar} className="text-gray-500 hover:text-black">
                <X size={24} />
              </button>
            </div>

            {/* Lista de Items */}
            {cart.length > 0 ? (
              <div className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {cart.map(item => (
                  <div key={`${item.id}-${item.modoVenta}`} className="flex gap-4">
                    <img src={item.imagen} alt={item.nombre} className="w-24 h-24 object-contain border rounded-md bg-gray-50" />
                    <div className="flex-grow flex flex-col">
                      <p className="font-semibold text-sm line-clamp-2 text-gray-800">{item.nombre}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatearPrecio(item.precio)}</p>
                      <div className="flex items-center gap-3 mt-auto">
                        <div className="flex items-center border rounded-md">
                          <button onClick={() => cambiarCantidad(item.id, item.cantidad - 1, item.modoVenta)} className="px-2 py-1 text-lg">-</button>
                          <span className="px-2 text-sm font-semibold">{item.cantidad}</span>
                          <button onClick={() => cambiarCantidad(item.id, item.cantidad + 1, item.modoVenta)} className="px-2 py-1 text-lg">+</button>
                        </div>
                        <button onClick={() => quitarDelCarrito(item.id, item.modoVenta)} className="text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">{formatearPrecio(item.precio * item.cantidad)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-center p-6">
                <ShoppingCart size={48} className="text-gray-300 mb-4" />
                <h3 className="font-bold text-lg text-gray-800">Tu carrito está vacío</h3>
                <p className="text-gray-500 mt-1">Agregá productos para empezar a comprar.</p>
              </div>
            )}
            
            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-6 border-t bg-white">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold text-gray-800">Total:</span>
                  <span className="text-2xl font-bold text-gray-900">{formatearPrecio(total)}</span>
                </div>
                <Link
                  to="/checkout"
                  onClick={toggleSidebar}
                  className="w-full block text-center bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Finalizar Compra
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartPanel;