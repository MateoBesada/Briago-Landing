import React, { useState } from 'react';

export default function CalculadoraEnvio() {
    const [cp, setCp] = useState('');
    const [provincia, setProvincia] = useState('B'); // B = Buenos Aires por defecto
    const [resultados, setResultados] = useState<any[]>([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    const manejarCalculo = async (e: React.FormEvent) => {
        e.preventDefault();
        setCargando(true);
        setError('');
        setResultados([]);

        try {
            const respuesta = await fetch('http://localhost:3001/api/cotizar', {
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

    return (
        <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm mb-6">
            <h3 className="text-xl font-bold text-black uppercase tracking-tight mb-4 flex items-center gap-2">
                <span>🚚</span> Calcular Costo de Envío
            </h3>

            <form onSubmit={manejarCalculo} className="space-y-4">
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

                <button
                    type="submit"
                    disabled={cargando}
                    className="w-full bg-black text-[#fff03b] font-bold uppercase py-3 rounded-xl hover:bg-gray-900 transition-colors disabled:opacity-50"
                >
                    {cargando ? 'Calculando...' : 'Ver Precios'}
                </button>
            </form>

            {/* Mensajes de Error */}
            {error && <p className="text-red-500 text-sm mt-3 font-medium">{error}</p>}

            {/* Lista de Resultados */}
            {resultados.length > 0 && (
                <div className="mt-6 space-y-3">
                    {resultados.map((opcion, index) => (
                        <div key={index} className="p-3 border border-gray-100 rounded-lg flex flex-col bg-gray-50">
                            <div className="font-bold text-sm text-black">
                                {opcion.correo.nombre} <span className="font-normal text-gray-500">- {opcion.servicio.nombre}</span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-xs text-gray-500">⏱ {opcion.horas_entrega}hs</span>
                                <span className="font-bold text-green-600">${opcion.valor}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}