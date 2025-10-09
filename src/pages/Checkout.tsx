import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '@/context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

declare global {
  interface Window {
    MercadoPago: any;
  }
}

const formatearPrecio = (precio: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(precio);

// [SIN CAMBIOS] Tu componente de input se mantiene igual.
const FloatingLabelInput = ({ id, name, type, value, onChange, placeholder, required = true, isTextArea = false }: any) => (
  <div className="relative">
    {isTextArea ? (
      <textarea
        id={id} name={name} value={value} onChange={onChange} required={required} placeholder=" "
        className="block px-3 pb-2 pt-5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 peer min-h-[80px]"
      />
    ) : (
      <input type={type} id={id} name={name} value={value} onChange={onChange} required={required} placeholder=" "
        className="block px-3 pb-2 pt-5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 peer"
      />
    )}
    <label htmlFor={id}
      className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] start-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4"
    >
      {placeholder}
    </label>
  </div>
);


const CheckoutPage = () => {
  const { cart, vaciarCarrito } = useCart();
  const navigate = useNavigate();
  const brickRef = useRef<HTMLDivElement | null>(null);

  const [isBrickVisible, setIsBrickVisible] = useState(false);
  const [isPreferenceLoading, setIsPreferenceLoading] = useState(false);

  // [CAMBIO 1 de 3] Agregamos los nuevos campos al estado inicial.
  const [formData, setFormData] = useState({
    fullname: "", email: "", address: "", city: "", postalcode: "", phone: "",
    entreCalles: "", // <-- NUEVO CAMPO
    descripcion: "", // <-- NUEVO CAMPO
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const total = cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

  // [SIN CAMBIOS] Toda la lógica de useEffect se mantiene intacta.
  useEffect(() => {
    if (cart.length === 0 && !isBrickVisible) {
      toast.error("Tu carrito está vacío.");
      navigate('/productos');
    }
  }, [cart, navigate, isBrickVisible]);

  useEffect(() => {
    if (!isBrickVisible) return;
    const scriptId = 'mercadopago-sdk';
    const initBrick = async () => {
      setIsPreferenceLoading(true);
      try {
        if (!window.MercadoPago) {
          throw new Error("MercadoPago SDK no está disponible.");
        }
        const mp = new window.MercadoPago("APP_USR-9aa2c361-7d29-4154-885f-09dfc9c58c0e", { locale: "es-AR" });
        const mpItems = cart.map(item => ({
          title: item.nombre,
          unit_price: item.precio,
          quantity: item.cantidad,
        }));
        const [firstName, ...lastNameParts] = formData.fullname.trim().split(' ');
        const mpPayer = {
          name: firstName || '',
          surname: lastNameParts.join(' ') || '',
          email: formData.email,
          phone: { number: formData.phone },
          address: { zip_code: formData.postalcode, street_name: formData.address }
        };
        const res = await fetch("https://checkout-server-gehy.onrender.com/create_preference", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: mpItems,
            payer: formData,
            external_reference: `BRIAGO-${Date.now()}`
          }),
        });
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Error del servidor al crear la preferencia.');
        }
        const { preferenceId } = await res.json();
        if (!preferenceId) throw new Error("No se pudo crear la preferencia de pago.");
        if (brickRef.current) brickRef.current.innerHTML = "";
        await mp.bricks().create("payment", "paymentBrick_container", {
          initialization: { amount: total, preferenceId },
          customization: { paymentMethods: { creditCard: "all", debitCard: "all", mercadoPago: "all", ticket: "all" } },
          callbacks: {
            onSubmit: async () => {
              toast.success('¡Pago procesado con éxito!');
              vaciarCarrito();
              navigate('/compra-exitosa');
            },
            onReady: () => setIsPreferenceLoading(false),
            onError: (err: any) => {
              toast.error("Hubo un error al procesar el pago.");
              console.error("Error en Brick:", err);
              setIsBrickVisible(false);
              setIsPreferenceLoading(false);
            },
          },
        });
      } catch (error: any) {
        toast.error(error.message || "No se pudo conectar con el servicio de pago.");
        console.error("Error al renderizar Brick:", error);
        setIsBrickVisible(false);
        setIsPreferenceLoading(false);
      }
    };
    if (!window.MercadoPago) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = "https://sdk.mercadopago.com/js/v2";
      script.async = true;
      script.onload = initBrick;
      document.body.appendChild(script);
    } else {
      initBrick();
    }
  }, [isBrickVisible, total, formData, cart, navigate, vaciarCarrito]);

  // [CAMBIO 2 de 3] Actualizamos la validación para ignorar los campos opcionales.
  const handleProceedToPayment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const requiredFields: (keyof typeof formData)[] = ['fullname', 'email', 'address', 'city', 'postalcode', 'phone'];
    const isInvalid = requiredFields.some(field => formData[field].trim() === "");

    if (isInvalid) {
      toast.error("Por favor, completá todos tus datos obligatorios para continuar.");
      return;
    }
    setIsBrickVisible(true);
  };

  return (
    <div className="bg-gray-100 font-gotham min-h-screen pt-10">
      <section className="container mx-auto px-4 sm:px-6 py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Finalizar Compra</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md relative">
              <AnimatePresence>
                {isPreferenceLoading && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-lg"
                  >
                    <Loader2 className="animate-spin text-yellow-500" size={48} />
                    <p className="mt-4 font-semibold text-gray-700">Aguarde un momento...</p>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className={isPreferenceLoading ? 'filter blur-sm pointer-events-none' : ''}>
                <AnimatePresence mode="wait">
                  {!isBrickVisible ? (
                    <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <h3 className="text-xl font-bold mb-6">Tus Datos de Contacto y Envío</h3>
                      <form id="checkout-form" onSubmit={handleProceedToPayment} className="space-y-6">
                        <FloatingLabelInput id="fullname" name="fullname" type="text" value={formData.fullname} onChange={handleInputChange} placeholder="Nombre Completo" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FloatingLabelInput id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Correo Electrónico" />
                          <FloatingLabelInput id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="Teléfono" />
                        </div>
                        <FloatingLabelInput id="address" name="address" type="text" value={formData.address} onChange={handleInputChange} placeholder="Dirección de Envío" />
                        
                        {/* --- [CAMBIO 3 de 3] AÑADIMOS LOS NUEVOS CAMPOS AL FORMULARIO --- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FloatingLabelInput id="city" name="city" type="text" value={formData.city} onChange={handleInputChange} placeholder="Ciudad" />
                            <FloatingLabelInput id="postalcode" name="postalcode" type="text" value={formData.postalcode} onChange={handleInputChange} placeholder="Código Postal" />
                        </div>
                        <FloatingLabelInput 
                            id="entreCalles" 
                            name="entreCalles" 
                            type="text" 
                            value={formData.entreCalles} 
                            onChange={handleInputChange} 
                            placeholder="Entre qué calles (Opcional)" 
                            required={false} // <-- Marcado como opcional
                        />
                        <FloatingLabelInput 
                            id="descripcion" 
                            name="descripcion" 
                            value={formData.descripcion} 
                            onChange={handleInputChange} 
                            placeholder="Descripción adicional (Opcional)"
                            required={false} // <-- Marcado como opcional
                            isTextArea={true} // Usamos un textarea para más espacio
                        />
                         {/* --- FIN DE LOS CAMPOS AÑADIDOS --- */}
                         
                      </form>
                    </motion.div>
                  ) : (
                    <motion.div key="brick" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <h3 className="text-xl font-bold mb-6">Realizá tu Pago</h3>
                        <div id="paymentBrick_container" ref={brickRef}></div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-28">
              <h3 className="text-xl font-bold mb-4 border-b pb-4">Tu Pedido</h3>
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                {cart.map(item => (
                  <div key={`${item.id}-${item.modoVenta}`} className="flex justify-between items-start text-sm">
                    <div className="flex gap-3">
                      <img src={item.imagen} className="w-16 h-16 object-contain rounded border p-1" alt={item.nombre} />
                      <div>
                        <p className="font-semibold line-clamp-2">{item.nombre}</p>
                        <p className="text-gray-600">{formatearPrecio(item.precio)} <span className="text-gray-500">x {item.cantidad}</span></p>
                      </div>
                    </div>
                    <p className="font-semibold">{formatearPrecio(item.precio * item.cantidad)}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center border-t pt-4">
                <span className="text-lg font-bold">Total</span>
                <span className="text-lg font-bold text-gray-900">{formatearPrecio(total)}</span>
              </div>
              
              {!isBrickVisible && (
                <button
                  type="submit" form="checkout-form"
                  className="mt-6 w-full bg-black hover:bg-gray-800 text-white font-bold py-3 rounded-md transition duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                  disabled={isPreferenceLoading}
                >
                  Continuar al Pago
                </button>
              )}
              <Link to="/productos" className="block mt-2 w-full text-center text-sm text-gray-600 hover:underline">
                &larr; Volver y seguir comprando
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CheckoutPage;