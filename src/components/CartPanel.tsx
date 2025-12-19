import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
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
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
          />

          {/* Panel del Carrito */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: "0%" }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", ease: "easeInOut", duration: 0.4 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-black text-white">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-6 h-6 text-[#fff03b]" />
                <h2 className="text-xl font-black uppercase tracking-wider">Tu Carrito</h2>
              </div>
              <button
                onClick={toggleSidebar}
                className="text-gray-400 hover:text-[#fff03b] transition-colors p-1 rounded-full hover:bg-white/10"
              >
                <X size={24} />
              </button>
            </div>

            {/* Lista de Items */}
            {cart.length > 0 ? (
              <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gray-50">
                {cart.map(item => (
                  <div
                    key={`${item.id}-${item.modoVenta}`}
                    className="group bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-black transition-all duration-300 flex gap-4"
                  >
                    <div className="w-24 h-24 bg-gray-50 rounded-lg flex items-center justify-center p-2 group-hover:bg-[#fff03b]/10 transition-colors">
                      <img
                        src={item.imagen}
                        alt={item.nombre}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </div>

                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-sm text-black uppercase tracking-tight line-clamp-2 leading-tight">
                          {item.nombre}
                        </h3>
                        {item.modoVenta && (
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1 block">
                            {item.modoVenta}
                          </span>
                        )}
                      </div>

                      <div className="flex items-end justify-between mt-2">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-400 font-medium">Precio un.</span>
                          <span className="font-bold text-black">{formatearPrecio(item.precio)}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-gray-200 rounded-lg bg-white">
                            <button
                              onClick={() => cambiarCantidad(item.id, item.cantidad - 1, item.modoVenta)}
                              className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 transition-colors"
                              disabled={item.cantidad <= 1}
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-8 text-center text-sm font-bold">{item.cantidad}</span>
                            <button
                              onClick={() => cambiarCantidad(item.id, item.cantidad + 1, item.modoVenta)}
                              className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          <button
                            onClick={() => quitarDelCarrito(item.id, item.modoVenta)}
                            className="text-gray-300 hover:text-red-500 transition-colors p-1"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-center p-8 bg-white">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <ShoppingCart size={40} className="text-gray-300" />
                </div>
                <h3 className="font-black text-xl text-black uppercase tracking-tight mb-2">
                  Tu carrito está vacío
                </h3>
                <p className="text-gray-500 max-w-xs mx-auto">
                  ¡Explora nuestro catálogo y encuentra las mejores herramientas y pinturas!
                </p>
                <button
                  onClick={toggleSidebar}
                  className="mt-8 px-8 py-3 bg-black text-white font-bold uppercase tracking-wider text-sm rounded-full hover:bg-[#fff03b] hover:text-black transition-all duration-300"
                >
                  Empezar a comprar
                </button>
              </div>
            )}

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-end mb-6">
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total estimado</span>
                  <span className="text-3xl font-black text-black tracking-tight">{formatearPrecio(total)}</span>
                </div>

                <div className="space-y-3">
                  <Link
                    to="/checkout"
                    onClick={toggleSidebar}
                    className="group w-full flex items-center justify-center gap-2 bg-[#fff03b] text-black font-black uppercase tracking-wider py-4 rounded-xl hover:bg-black hover:text-[#fff03b] transition-all duration-300 shadow-lg hover:shadow-xl transform active:scale-[0.98]"
                  >
                    Finalizar Compra
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    to="/carrito"
                    onClick={toggleSidebar}
                    className="block w-full text-center text-xs font-bold text-gray-400 hover:text-black uppercase tracking-widest py-2 transition-colors"
                  >
                    Ver carrito completo
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartPanel;