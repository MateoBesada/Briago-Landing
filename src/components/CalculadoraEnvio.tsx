import React, { useState } from 'react';

interface CalculadoraEnvioProps {
    onSelect?: (costo: number, detalle: string, cp: string) => void;
}

export default function CalculadoraEnvio({ onSelect }: CalculadoraEnvioProps) {
    const [cp, setCp] = useState('');
    const [provincia, setProvincia] = useState('B'); // B = Buenos Aires por defecto
    const [resultados, setResultados] = useState<any[]>([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');
    const [seleccionadoIndex, setSeleccionadoIndex] = useState<number | null>(null);

    const manejarCalculo = async (e: React.FormEvent) => {
        e.preventDefault();
        setCargando(true);
        setError('');
        setResultados([]);
        setSeleccionadoIndex(null);
        if (onSelect) onSelect(0, '', ''); // Reiniciar selección padre

        try {
            const respuesta = await fetch('https://checkout-server-gehy.onrender.com/api/cotizar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    codigo_postal: cp,
                    provincia: provincia
                })
            });

            if (!respuesta.ok) {
                const errorData = await respuesta.json().catch(() => ({}));
                throw new Error(errorData.error || `Error del servidor: ${respuesta.status}`);
            }

            const datos = await respuesta.json();

            if (Array.isArray(datos)) {
                setResultados(datos);
            } else {
                setError('No se encontraron opciones de envío para esa zona.');
            }

        } catch (err: any) {
            console.error(err);
            if (err.message.includes('Failed to fetch')) {
                setError('No se pudo conectar con el servidor. Asegurate de que "node server.js" esté corriendo.');
            } else {
                setError(err.message || 'Ocurrió un error al calcular el envío.');
            }
        } finally {
            setCargando(false);
        }
    };

    const seleccionarEnvio = (index: number, opcion: any) => {
        setSeleccionadoIndex(index);
        if (onSelect) {
            const detalle = `${opcion.correo.nombre} - ${opcion.servicio.nombre} (${opcion.horas_entrega}hs)`;
            onSelect(opcion.valor, detalle, cp);
        }
    };

    return (
        <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm mb-6">
            <h3 className="text-xl font-bold text-black uppercase tracking-tight mb-4 flex items-center gap-2">
                <span>🚚</span> Calcular Costo de Envío
            </h3>

            <p className="text-sm text-gray-500 mb-4">
                Ingresá tu código postal para ver las opciones de envío a domicilio.
            </p>

            <form onSubmit={manejarCalculo} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Provincia
                        </label>
                        <select
                            value={provincia}
                            onChange={(e) => setProvincia(e.target.value)}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-0 focus:border-black transition-colors appearance-none"
                        >
                            <option value="C">Capital Federal (CABA)</option>
                            <option value="B">Buenos Aires (GBA/Interior)</option>
                            <option value="X">Córdoba</option>
                            <option value="S">Santa Fe</option>
                            <option value="M">Mendoza</option>
                            {/* Agregá más si necesitás */}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Código Postal
                        </label>
                        <input
                            type="text"
                            value={cp}
                            onChange={(e) => setCp(e.target.value)}
                            placeholder="Ej: 1704"
                            required
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-0 focus:border-black transition-colors"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={cargando}
                    className="w-full bg-black text-[#fff03b] font-bold uppercase py-3 rounded-xl hover:bg-gray-900 transition-colors disabled:opacity-50"
                >
                    {cargando ? 'Calculando...' : 'Ver Costos de Envío'}
                </button>
            </form>

            {/* Mensajes de Error */}
            {error && <p className="text-red-500 text-sm mt-3 font-medium">{error}</p>}

            {/* Lista de Resultados */}
            {resultados.length > 0 && (
                <div className="mt-6 space-y-3">
                    <h4 className="text-sm font-bold text-gray-900 uppercase">Opciones Disponibles:</h4>
                    {resultados.map((opcion, index) => (
                        <div
                            key={index}
                            onClick={() => seleccionarEnvio(index, opcion)}
                            className={`p-4 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${seleccionadoIndex === index
                                ? 'border-black bg-gray-50 ring-1 ring-black'
                                : 'border-gray-200 hover:border-gray-400'
                                }`}
                        >
                            <div className="flex flex-col">
                                <span className="font-bold text-sm text-black">
                                    {opcion.correo.nombre} <span className="font-normal text-gray-500">- {opcion.servicio.nombre}</span>
                                </span>
                                <span className="text-xs text-gray-500 mt-1">
                                    ⏱ Entrega estimada: {opcion.horas_entrega}hs
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-black text-lg">${opcion.valor}</span>
                                <div className={`w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center ${seleccionadoIndex === index ? 'border-black' : ''}`}>
                                    {seleccionadoIndex === index && <div className="w-3 h-3 bg-black rounded-full" />}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}