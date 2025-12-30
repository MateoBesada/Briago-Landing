import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, ArrowLeft, ShieldCheck, Lock, CreditCard, Store, Truck } from 'lucide-react';
import CalculadoraEnvio from '@/components/CalculadoraEnvio';

// Helper para formatear dinero
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
  const { cart } = useCart();
  const navigate = useNavigate();

  // ---------------------------------------------------------

  const [isLoading, setIsLoading] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingDetail, setShippingDetail] = useState('');
  const [calculatorZip, setCalculatorZip] = useState('');

  const [formData, setFormData] = useState({
    fullname: "", email: "", address: "", city: "", postalcode: "", phone: "",
    dni: "", entreCalles: "", descripcion: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const total = subtotal + shippingCost;

  useEffect(() => {
    if (cart.length === 0) {
      //   toast.error("Tu carrito está vacío.");
      //   navigate('/productos');
    }
  }, [cart, navigate]);

  const handlePay = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const requiredFields: (keyof typeof formData)[] = ['fullname', 'email', 'phone', 'dni'];
    const isInvalid = requiredFields.some(field => formData[field].trim() === "");

    if (isInvalid) {
      toast.error("Por favor, completá todos tus datos obligatorios.");
      return;
    }

    if (deliveryMethod === 'delivery') {
      const requiredDeliveryFields: (keyof typeof formData)[] = ['address', 'city', 'postalcode'];
      if (requiredDeliveryFields.some(field => formData[field].trim() === "")) {
        toast.error("Faltan datos de envío.");
        return;
      }

      if (shippingCost === 0) {
        toast.error("Calculá el costo de envío antes de continuar.");
        return;
      }

      if (formData.postalcode.trim() !== calculatorZip.trim()) {
        toast.error(`El Código Postal del formulario (${formData.postalcode}) no coincide con el calculado (${calculatorZip}).`);
        return;
      }
    }

    setIsLoading(true);

    try {
      const mpItems = cart.map(item => ({
        id: item.id,
        title: item.nombre,
        unit_price: Number(item.precio),
        quantity: Number(item.cantidad),
        currency_id: 'ARS'
      }));

      if (deliveryMethod === 'delivery' && shippingCost > 0) {
        mpItems.push({
          id: 'envio',
          title: `Envío: ${shippingDetail || 'A domicilio'}`,
          unit_price: Number(shippingCost),
          quantity: 1,
          currency_id: 'ARS'
        });
      }

      const [firstName, ...lastNameParts] = formData.fullname.trim().split(' ');
      const mpPayer = {
        name: firstName || 'Cliente',
        surname: lastNameParts.join(' ') || 'SinApellido',
        email: formData.email,
        phone: { area_code: "", number: formData.phone },
        identification: { type: "DNI", number: formData.dni },
        address: { zip_code: formData.postalcode, street_name: formData.address }
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

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error al crear preferencia");

      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error("El servidor no devolvió la URL de pago.");
      }

    } catch (error: any) {
      console.error(error);
      toast.error("Hubo un error al iniciar el pago. Intenta nuevamente.");
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------
  // 🔒 PANTALLA DE BLOQUEO (ELIMINADA / DESACTIVADA)
  // ---------------------------------------------------------
  // He quitado el bloque "if (!isAuthorized) return ..." para que 
  // pase directo a la pantalla de abajo.

  // ---------------------------------------------------------
  // PANTALLA NORMAL (AHORA SE VE SIEMPRE)
  // ---------------------------------------------------------
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
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center"
                  >
                    <Loader2 className="animate-spin text-[#fff03b]" size={48} />
                    <p className="mt-4 font-bold text-black uppercase tracking-wider">Redirigiendo a Mercado Pago...</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <form id="checkout-form" onSubmit={handlePay}>
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-[#fff03b] font-bold text-xl">1</div>
                  <h3 className="text-xl font-bold text-black uppercase tracking-tight">Tus Datos</h3>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <button type="button" onClick={() => { setDeliveryMethod('pickup'); setShippingCost(0); }}
                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${deliveryMethod === 'pickup' ? 'bg-black text-[#fff03b] border-black' : 'bg-white text-gray-600 border-gray-200'}`}>
                    <Store className="w-6 h-6" />
                    <span className="font-bold text-sm uppercase">Retiro en Tienda</span>
                  </button>
                  <button type="button" onClick={() => setDeliveryMethod('delivery')}
                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${deliveryMethod === 'delivery' ? 'bg-black text-[#fff03b] border-black' : 'bg-white text-gray-600 border-gray-200'}`}>
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
                      // Auto-fill del CP en el formulario para conveniencia
                      setFormData(prev => ({ ...prev, postalcode: cp }));
                    }} />
                  </div>
                )}

                <div className="space-y-6">
                  <FloatingLabelInput id="fullname" name="fullname" type="text" value={formData.fullname} onChange={handleInputChange} placeholder="Nombre Completo" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FloatingLabelInput id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Correo Electrónico" />
                    <FloatingLabelInput id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="Teléfono" />
                  </div>
                  <FloatingLabelInput id="dni" name="dni" type="text" value={formData.dni} onChange={handleInputChange} placeholder="DNI / CUIT" />

                  <AnimatePresence>
                    {deliveryMethod === 'delivery' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-6 overflow-hidden">
                        <FloatingLabelInput id="address" name="address" type="text" value={formData.address} onChange={handleInputChange} placeholder="Dirección de Envío" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FloatingLabelInput id="city" name="city" type="text" value={formData.city} onChange={handleInputChange} placeholder="Ciudad" />
                          <FloatingLabelInput id="postalcode" name="postalcode" type="text" value={formData.postalcode} onChange={handleInputChange} placeholder="Código Postal" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <FloatingLabelInput id="descripcion" name="descripcion" type="text" value={formData.descripcion} onChange={handleInputChange} placeholder="Notas adicionales (Opcional)" isTextArea={true} required={false} />
                </div>
              </form>
            </div>

            <div className="flex items-center justify-center gap-6 text-gray-400 grayscale opacity-70 mt-4">
              <div className="flex items-center gap-2"><ShieldCheck className="w-5 h-5" /><span className="text-xs font-bold uppercase">Pago Seguro</span></div>
              <div className="flex items-center gap-2"><Lock className="w-5 h-5" /><span className="text-xs font-bold uppercase">Datos Encriptados</span></div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-black text-white p-8 rounded-3xl shadow-xl sticky top-28">
              <h3 className="text-xl font-black uppercase tracking-tight mb-8 pb-4 border-b border-gray-800">Resumen del Pedido</h3>

              <div className="space-y-4 mb-8 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-300">{item.cantidad}x {item.nombre}</span>
                    <span className="font-bold text-[#fff03b]">{formatearPrecio(item.precio * item.cantidad)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-800 pt-6 space-y-4">
                <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>{formatearPrecio(subtotal)}</span></div>
                <div className="flex justify-between text-gray-400"><span>Envío</span><span>{shippingCost > 0 ? formatearPrecio(shippingCost) : '-'}</span></div>
                <div className="flex justify-between items-end pt-4 border-t border-gray-800">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-3xl font-black text-[#fff03b]">{formatearPrecio(total)}</span>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={isLoading}
                className="mt-8 w-full bg-[#fff03b] text-black font-black uppercase tracking-wider py-4 rounded-xl hover:bg-white transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                PAGAR CON MERCADO PAGO
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;