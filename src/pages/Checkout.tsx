import { useState, useEffect, useRef } from "react";

declare global {
  interface Window {
    MercadoPago: any;
  }
}

export default function Checkout() {
  const brickRef = useRef<HTMLDivElement | null>(null);
  const [brickReady, setBrickReady] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    entrega: "retiro",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isComplete =
    formData.nombre.trim() && formData.email.trim() && formData.telefono.trim();

  // Este handleSubmit ya no se usa porque el botón está deshabilitado
  const handleSubmit = () => {
    alert("El sistema de pago está temporalmente deshabilitado.");
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!window.MercadoPago || !brickReady) return;

    const mp = new window.MercadoPago("APP_USR-9aa2c361-7d29-4154-885f-09dfc9c58c0e", {
      locale: "es-AR",
    });

    const renderBrick = async () => {
      const res = await fetch("https://checkout-server-gehy.onrender.com/create_preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 9999,
          description: "Briago Pinturas - Compra de prueba",
        }),
      });

      const { preferenceId } = await res.json();

      if (brickRef.current) {
        brickRef.current.innerHTML = "";
        const bricksBuilder = mp.bricks();

        await bricksBuilder.create("payment", "brick_container", {
          initialization: {
            amount: 2200,
            preferenceId,
          },
          customization: {
            paymentMethods: {
              creditCard: "all",
              debitCard: "all",
              mercadoPago: "all",
              ticket: "all",
            },
          },
          callbacks: {
            onSubmit: (params: any) => {
              console.log("Pago enviado", params);
            },
            onReady: () => {
              console.log("Brick cargado");
            },
            onError: (err: any) => {
              console.error("Error en el Brick:", err);
            },
          },
        });
      }
    };

    renderBrick();
  }, [brickReady]);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8 transition-all animate-fade-in">
        <h1 className="text-4xl font-semibold text-center mb-6 text-neutral-800">Finalizar Compra</h1>

        <div className="grid grid-cols-1 gap-6">
          <input
            type="text"
            name="nombre"
            placeholder="Nombre completo*"
            value={formData.nombre}
            onChange={handleInputChange}
            className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/50 transition"
          />
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico*"
            value={formData.email}
            onChange={handleInputChange}
            className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/50 transition"
          />
          <input
            type="tel"
            name="telefono"
            placeholder="Teléfono*"
            value={formData.telefono}
            onChange={handleInputChange}
            className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/50 transition"
          />

          <div>
            <p className="font-medium text-neutral-700 mb-2">Método de entrega:</p>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm text-neutral-800">
                <input
                  type="radio"
                  name="entrega"
                  value="retiro"
                  checked={formData.entrega === "retiro"}
                  onChange={handleInputChange}
                  className="accent-black"
                />
                Retiro en local
              </label>
              <label className="flex items-center gap-2 text-sm text-neutral-800">
                <input
                  type="radio"
                  name="entrega"
                  value="envio"
                  checked={formData.entrega === "envio"}
                  onChange={handleInputChange}
                  className="accent-black"
                />
                Envío a domicilio (a partir de $60.000)
              </label>
            </div>
          </div>

          {/* Botón de pago deshabilitado */}
          <button
            disabled
            className="w-full py-3 rounded-lg text-white font-semibold bg-gray-400 cursor-not-allowed"
          >
            El sistema de pago está temporalmente deshabilitado.
          </button>

          {brickReady && (
            <div
              id="brick_container"
              ref={brickRef}
              className="animate-fade-in"
            />
          )}
        </div>
      </div>
    </div>
  );
}
