import { useCart } from "@/context/CartContext";
import { FaTrash } from "react-icons/fa";
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-yellow-50 text-gray-700 px-4 text-center">
        <p className="text-4xl font-extrabold text-black mb-6">Tu carrito está vacío</p>
        <button
          onClick={() => navigate("/")}
          className="px-8 py-3 text-lg border-2 border-black text-black rounded-full hover:bg-black hover:text-[#fff03b] transition-all shadow-md"
        >
          Volver a la tienda
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-50 py-10 px-4 font-gotham flex justify-center">
      <div className="w-full max-w-7xl">
        <h1 className="text-4xl font-black mb-10 text-black text-center uppercase animate-fade-in">
          Carrito de compras
        </h1>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Productos */}
          <div className="flex-1 flex flex-col gap-6 max-h-[75vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-yellow-400 scrollbar-track-gray-200">
            {cart.map((item) => {
              const precioUnitario = item.precio ?? 0;
              const subtotal = precioUnitario * item.cantidad;

              return (
                <div
                  key={item.id + (item.modoVenta || "")}
                  className="flex items-start gap-5 bg-white rounded-3xl shadow-md p-5 border border-gray-200 hover:shadow-xl transition-all animate-pop-in"
                >
                  <img
                    src={item.imagen}
                    alt={item.nombre}
                    className="w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-xl border border-gray-200"
                  />

                  <div className="flex-1">
                    <h2 className="text-lg sm:text-xl font-semibold text-black mb-1 leading-tight">
                      {item.nombre}
                      {item.grano && (
                        <span className="text-sm text-gray-500"> – Grano {item.grano}</span>
                      )}
                      {item.modoVenta && (
                        <span className="text-sm text-gray-500 ml-2">
                          ({item.modoVenta === "unidad" ? "Unidad" : "Caja"})
                        </span>
                      )}
                    </h2>

                    <p className="text-sm text-gray-500">
                      Precio unitario: <span className="font-medium">${precioUnitario.toLocaleString()}</span>
                    </p>
                    <p className="text-sm text-gray-500 mb-3">
                      Subtotal: <span className="font-medium">${subtotal.toLocaleString()}</span>
                    </p>

                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <button
                        onClick={() =>
                          item.cantidad > 1 &&
                          cambiarCantidad(item.id, item.cantidad - 1, item.modoVenta)
                        }
                        disabled={item.cantidad === 1}
                        className={`w-9 h-9 text-xl rounded-full border text-black font-bold flex items-center justify-center transition shadow-sm ${
                          item.cantidad === 1
                            ? "cursor-not-allowed bg-gray-200 text-gray-400 border-gray-300"
                            : "hover:scale-105 hover:bg-black hover:text-yellow-300"
                        }`}
                      >
                        −
                      </button>
                      <span className="text-lg font-semibold text-black px-2">{item.cantidad}</span>
                      <button
                        onClick={() =>
                          cambiarCantidad(item.id, item.cantidad + 1, item.modoVenta)
                        }
                        className="w-9 h-9 text-xl rounded-full border text-black font-bold flex items-center justify-center hover:scale-105 hover:bg-black hover:text-yellow-300 transition shadow-sm"
                      >
                        +
                      </button>

                      <button
                        onClick={() => quitarDelCarrito(item.id, item.modoVenta)}
                        className="ml-auto text-red-600 hover:text-red-800 transition hover:scale-110"
                        title="Eliminar producto"
                      >
                        <FaTrash size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Resumen */}
          <div className="lg:w-96 p-8 bg-white rounded-3xl shadow-xl border border-gray-300 h-fit sticky top-6 animate-fade-in">
            <h2 className="text-2xl font-extrabold text-center text-black mb-6">
              Total: ${total.toLocaleString()}
            </h2>

            <button
              onClick={() => navigate("/")}
              className="w-full py-3 mb-4 bg-white border-2 border-black text-black rounded-full hover:bg-black hover:text-[#fff03b] transition font-semibold text-base shadow-sm hover:scale-105"
            >
              Seguir comprando
            </button>

            <button
              onClick={() => navigate("/checkout")}
              className="w-full py-3 bg-[#fff03b] text-black hover:bg-yellow-300 rounded-full font-bold transition text-base shadow-md hover:scale-105"
            >
              FINALIZAR PEDIDO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
