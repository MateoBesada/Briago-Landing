import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '@/context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, ArrowLeft, ShieldCheck, Lock, CreditCard, Store, Truck } from 'lucide-react';
import CalculadoraEnvio from '@/components/CalculadoraEnvio';

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

const FloatingLabelInput = ({ id, name, type, value, onChange, placeholder, required = true, isTextArea = false }: any) => (
  <div className="relative group">
    {isTextArea ? (
      <textarea
        id={id} name={name} value={value} onChange={onChange} required={required} placeholder=" "
        className="block px-4 pb-2.5 pt-6 w-full text-sm text-gray-900 bg-white rounded-xl border border-gray-200 appearance-none focus:outline-none focus:ring-0 focus:border-black peer min-h-[100px] transition-colors"
      />
    ) : (
      <input type={type} id={id} name={name} value={value} onChange={onChange} required={required} placeholder=" "
        className="block px-4 pb-2.5 pt-6 w-full text-sm text-gray-900 bg-white rounded-xl border border-gray-200 appearance-none focus:outline-none focus:ring-0 focus:border-black peer transition-colors"
      />
    )}
    <label htmlFor={id}
      className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] start-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-black font-medium"
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

  // Estados para envío
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingDetail, setShippingDetail] = useState('');
  const [calculatorZip, setCalculatorZip] = useState('');

  const [formData, setFormData] = useState({
    fullname: "", email: "", address: "", city: "", postalcode: "", phone: "",
    dni: "",
    entreCalles: "",
    descripcion: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const total = subtotal + shippingCost;

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

        if (deliveryMethod === 'delivery' && shippingCost > 0) {
          mpItems.push({
            title: "Costo de envío",
            unit_price: shippingCost,
            quantity: 1
          });
        }
        const [firstName, ...lastNameParts] = formData.fullname.trim().split(' ');
        const mpPayer = {
          name: firstName || '',
          surname: lastNameParts.join(' ') || '',
          email: formData.email,
          phone: { number: formData.phone },
          address: { zip_code: formData.postalcode, street_name: formData.address },
          identification: { type: "DNI", number: formData.dni }
        };
        const res = await fetch("https://checkout-server-gehy.onrender.com/create_preference", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: mpItems,
            payer: mpPayer,
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

  const handleProceedToPayment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Campos obligatorios básicos (Siempre requeridos)
    const requiredFields: (keyof typeof formData)[] = ['fullname', 'email', 'phone', 'dni'];
    const isInvalid = requiredFields.some(field => formData[field].trim() === "");

    if (isInvalid) {
      toast.error("Por favor, completá todos tus datos obligatorios para continuar.");
      return;
    }

    if (deliveryMethod === 'delivery') {
      const requiredDeliveryFields: (keyof typeof formData)[] = ['address', 'city', 'postalcode', 'dni'];
      const isDeliveryInvalid = requiredDeliveryFields.some(field => formData[field].trim() === "");

      if (isDeliveryInvalid) {
        toast.error("Por favor, completá los datos de envío.");
        return;
      }

      if (shippingCost === 0) {
        toast.error("Por favor, calculá y seleccioná una opción de envío.");
        return;
      }

      if (formData.postalcode.trim() !== calculatorZip.trim()) {
        toast.error(`El Código Postal del formulario (${formData.postalcode}) no coincide con el calculado (${calculatorZip}). Por favor, corregilo.`);
        return;
      }
    }

    setIsBrickVisible(true);
  };

  return (
    <div className="bg-gray-50 font-gotham min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/carrito" className="p-2 hover:bg-white rounded-full transition-colors shadow-sm">
            <ArrowLeft className="w-6 h-6 text-black" />
          </Link>
          <h1 className="text-3xl md:text-4xl font-black text-black uppercase tracking-tight">
            Finalizar Compra
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
              <AnimatePresence>
                {isPreferenceLoading && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center"
                  >
                    <Loader2 className="animate-spin text-[#fff03b]" size={48} />
                    <p className="mt-4 font-bold text-black uppercase tracking-wider">Procesando pago...</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className={isPreferenceLoading ? 'filter blur-sm pointer-events-none' : ''}>
                <AnimatePresence mode="wait">
                  {!isBrickVisible ? (
                    <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
                        <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-[#fff03b] font-bold text-xl">1</div>
                        <h3 className="text-xl font-bold text-black uppercase tracking-tight">Datos de Entrega</h3>
                      </div>

                      {/* Selector de Método de Entrega */}
                      <div className="grid grid-cols-2 gap-4 mb-8">
                        <button
                          type="button"
                          onClick={() => {
                            setDeliveryMethod('pickup');
                            setShippingCost(0);
                            setShippingDetail('');
                            setCalculatorZip('');
                          }}
                          className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${deliveryMethod === 'pickup'
                            ? 'bg-black text-[#fff03b] border-black'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                            }`}
                        >
                          <Store className="w-6 h-6" />
                          <span className="font-bold text-sm uppercase">Retiro en Tienda</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeliveryMethod('delivery')}
                          className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${deliveryMethod === 'delivery'
                            ? 'bg-black text-[#fff03b] border-black'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                            }`}
                        >
                          <Truck className="w-6 h-6" />
                          <span className="font-bold text-sm uppercase">Envío a Domicilio</span>
                        </button>
                      </div>

                      {deliveryMethod === 'delivery' && (
                        <div className="mb-8">
                          <CalculadoraEnvio onSelect={(costo, detalle, cp) => {
                            setShippingCost(costo);
                            setShippingDetail(detalle);
                            setCalculatorZip(cp);
                          }} />
                        </div>
                      )}

                      <form id="checkout-form" onSubmit={handleProceedToPayment} className="space-y-6">
                        <FloatingLabelInput id="fullname" name="fullname" type="text" value={formData.fullname} onChange={handleInputChange} placeholder="Nombre Completo" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FloatingLabelInput id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Correo Electrónico" />
                          <FloatingLabelInput id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="Teléfono" />
                        </div>
                        <FloatingLabelInput id="dni" name="dni" type="text" value={formData.dni} onChange={handleInputChange} placeholder="DNI / CUIT" />

                        <AnimatePresence>
                          {deliveryMethod === 'delivery' && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="space-y-6 overflow-hidden"
                            >
                              <FloatingLabelInput id="address" name="address" type="text" value={formData.address} onChange={handleInputChange} placeholder="Dirección de Envío" />

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FloatingLabelInput id="city" name="city" type="text" value={formData.city} onChange={handleInputChange} placeholder="Ciudad" />
                                <FloatingLabelInput id="postalcode" name="postalcode" type="text" value={formData.postalcode} onChange={handleInputChange} placeholder="Código Postal (Debe coincidir con la cotización)" />
                              </div>
                              <FloatingLabelInput
                                id="entreCalles"
                                name="entreCalles"
                                type="text"
                                value={formData.entreCalles}
                                onChange={handleInputChange}
                                placeholder="Entre qué calles (Opcional)"
                                required={false}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <FloatingLabelInput
                          id="descripcion"
                          name="descripcion"
                          value={formData.descripcion}
                          onChange={handleInputChange}
                          placeholder="Notas adicionales (Opcional)"
                          required={false}
                          isTextArea={true}
                        />
                      </form>
                    </motion.div>
                  ) : (
                    <motion.div key="brick" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
                        <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-[#fff03b] font-bold text-xl">2</div>
                        <h3 className="text-xl font-bold text-black uppercase tracking-tight">Pago Seguro</h3>
                      </div>
                      <div id="paymentBrick_container" ref={brickRef}></div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6 text-gray-400 grayscale opacity-70">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-xs font-bold uppercase">Pago Seguro</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                <span className="text-xs font-bold uppercase">Datos Encriptados</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-black text-white p-8 rounded-3xl shadow-xl sticky top-28">
              <h3 className="text-xl font-black uppercase tracking-tight mb-8 pb-4 border-b border-gray-800">
                Resumen del Pedido
              </h3>

              <div className="space-y-4 mb-8 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {cart.map(item => (
                  <div key={`${item.id}-${item.modoVenta}`} className="flex gap-4 items-start group">
                    <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center p-1 flex-shrink-0">
                      <img src={item.imagen} className="w-full h-full object-contain mix-blend-multiply" alt={item.nombre} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-white line-clamp-2 leading-tight mb-1">{item.nombre}</p>
                      <div className="flex justify-between items-center">
                        <p className="text-gray-400 text-xs">{item.cantidad} x {formatearPrecio(item.precio)}</p>
                        <p className="font-bold text-[#fff03b] text-sm">{formatearPrecio(item.precio * item.cantidad)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-800 pt-6 space-y-4">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>{formatearPrecio(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Envío</span>
                  <span className={`text-md ${shippingCost > 0 ? 'text-gray-400' : 'text-gray-400'}`}>
                    {deliveryMethod === 'pickup' ? '-' : shippingCost > 0 ? formatearPrecio(shippingCost) : 'Por calcular'}
                  </span>
                </div>
                {shippingDetail && (
                  <div className="text-xs text-gray-500 text-right -mt-2">
                    {shippingDetail}
                  </div>
                )}
                <div className="flex justify-between items-end pt-4 border-t border-gray-800">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-3xl font-black text-[#fff03b]">{formatearPrecio(total)}</span>
                </div>
              </div>

              {!isBrickVisible && (
                <button
                  type="submit" form="checkout-form"
                  className="mt-8 w-full bg-[#fff03b] text-black font-black uppercase tracking-wider py-4 rounded-xl hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl transform active:scale-[0.98] flex items-center justify-center gap-2"
                  disabled={isPreferenceLoading}
                >
                  <CreditCard className="w-5 h-5" />
                  Continuar al Pago
                </button>
              )}

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  Al confirmar el pedido, aceptas nuestros términos y condiciones.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;