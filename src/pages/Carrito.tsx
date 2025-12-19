import { useCart } from "@/context/CartContext";
import { Trash2, Minus, Plus, ArrowLeft, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Carrito() {
  const { cart, quitarDelCarrito, cambiarCantidad } = useCart();
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => {
    const precio = item.precio ?? 0;
    return sum + precio * item.cantidad;
  }, 0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black px-4 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tight mb-4">
          Tu carrito está vacío
        </h2>
        <p className="text-gray-500 mb-8 max-w-md">
          Parece que aún no has añadido productos. Explora nuestro catálogo y encuentra lo que necesitas.
        </p>
        <button
          onClick={() => navigate("/")}
          className="group flex items-center gap-2 px-8 py-4 bg-black text-white font-bold uppercase tracking-wider hover:bg-[#fff03b] hover:text-black transition-all duration-300"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Volver a la tienda
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-4xl md:text-5xl font-black text-black uppercase tracking-tighter">
            Carrito de compras
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Productos */}
          <div className="flex-1 space-y-6">
            {cart.map((item) => {
              const precioUnitario = item.precio ?? 0;
              const subtotal = precioUnitario * item.cantidad;

              return (
                <div
                  key={item.id + (item.modoVenta || "")}
                  className="group flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-white p-6 border border-gray-200 hover:border-black transition-colors duration-300"
                >
                  <div className="relative w-full sm:w-32 h-32 bg-gray-50 flex items-center justify-center p-4 group-hover:bg-[#fff03b]/10 transition-colors">
                    <img
                      src={item.imagen}
                      alt={item.nombre}
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </div>

                  <div className="flex-1 w-full">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h2 className="text-xl font-bold text-black uppercase tracking-tight leading-tight">
                          {item.nombre}
                        </h2>
                        <div className="flex flex-wrap gap-2 mt-1 text-sm text-gray-500 font-medium">
                          {item.grano && (
                            <span className="bg-gray-100 px-2 py-0.5 rounded">
                              Grano: {item.grano}
                            </span>
                          )}
                          {item.modoVenta && (
                            <span className="bg-gray-100 px-2 py-0.5 rounded capitalize">
                              Venta por: {item.modoVenta}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => quitarDelCarrito(item.id, item.modoVenta)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-2"
                        title="Eliminar producto"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4">
                      <div className="flex items-center border border-gray-300">
                        <button
                          onClick={() =>
                            item.cantidad > 1 &&
                            cambiarCantidad(item.id, item.cantidad - 1, item.modoVenta)
                          }
                          disabled={item.cantidad === 1}
                          className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-12 text-center font-bold text-lg">
                          {item.cantidad}
                        </span>
                        <button
                          onClick={() =>
                            cambiarCantidad(item.id, item.cantidad + 1, item.modoVenta)
                          }
                          className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Subtotal</p>
                        <p className="text-xl font-black text-black">
                          ${subtotal.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Resumen */}
          <div className="lg:w-[400px]">
            <div className="bg-black text-white p-8 sticky top-28">
              <h2 className="text-2xl font-black uppercase tracking-tight mb-8 pb-4 border-b border-gray-800">
                Resumen del pedido
              </h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>${total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Envío</span>
                  <span className="text-[#fff03b] text-sm">Calculado en el siguiente paso</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-4 border-t border-gray-800">
                  <span>Total</span>
                  <span className="text-[#fff03b]">${total.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => navigate("/checkout")}
                  className="w-full py-4 bg-[#fff03b] text-black font-black uppercase tracking-wider hover:bg-white transition-colors duration-300"
                >
                  Finalizar Pedido
                </button>

                <button
                  onClick={() => navigate("/")}
                  className="w-full py-4 border border-white text-white font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-colors duration-300"
                >
                  Seguir comprando
                </button>
              </div>

              <div className="mt-8 flex items-center gap-3 justify-center text-gray-500 text-xs uppercase tracking-widest">
                <span className="w-2 h-2 bg-[#fff03b] rounded-full animate-pulse" />
                Compra segura y protegida
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
