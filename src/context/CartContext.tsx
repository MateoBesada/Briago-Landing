import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { Producto } from "../types/Producto";

// ✅ Tipo de ítem del carrito incluyendo precio y modoVenta
export interface CartItem extends Producto {
  cantidad: number;
  precio: number;
  modoVenta?: "unidad" | "caja";
}

interface CartContextType {
  cart: CartItem[];
  addItem: (item: CartItem) => void;
  quitarDelCarrito: (id: string, modoVenta?: "unidad" | "caja") => void;
  cambiarCantidad: (id: string, cantidad: number, modoVenta?: "unidad" | "caja") => void;
  vaciarCarrito: () => void;
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const addItem = (item: CartItem) => {
    setCart((prev) => {
      const existe = prev.find(
        (p) => p.id === item.id && p.modoVenta === item.modoVenta
      );

      if (existe) {
        return prev.map((p) =>
          p.id === item.id && p.modoVenta === item.modoVenta
            ? { ...p, cantidad: p.cantidad + item.cantidad }
            : p
        );
      }

      return [...prev, item];
    });

    setSidebarOpen(true);
  };

  const quitarDelCarrito = (id: string, modoVenta?: "unidad" | "caja") => {
    setCart((prev) =>
      prev.filter((p) => !(p.id === id && p.modoVenta === modoVenta))
    );
  };

  const cambiarCantidad = (id: string, cantidad: number, modoVenta?: "unidad" | "caja") => {
    setCart((prev) =>
      prev.map((p) =>
        p.id === id && p.modoVenta === modoVenta
          ? { ...p, cantidad: Math.max(cantidad, 1) }
          : p
      )
    );
  };

  const vaciarCarrito = () => setCart([]);

  // ✅ Cargar carrito desde localStorage al inicio
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("carrito");
      if (storedCart) {
        const parsed: CartItem[] = JSON.parse(storedCart);
        setCart(parsed);
      }
    } catch (error) {
      console.error("Error cargando carrito desde localStorage:", error);
    }
  }, []);

  // ✅ Guardar carrito en localStorage al cambiar
  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(cart));
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        quitarDelCarrito,
        cambiarCantidad,
        vaciarCarrito,
        toggleSidebar,
        isSidebarOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart debe usarse dentro de CartProvider");
  return context;
};
