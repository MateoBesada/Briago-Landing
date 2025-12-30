import React, { useState } from 'react';
import { Loader2, Truck, Package } from 'lucide-react';

interface CalculadoraEnvioProps {
    onSelect?: (costo: number, detalle: string, cp: string) => void;
}

const PROVINCIAS = [
    { id: 'C', nombre: 'Capital Federal (CABA)' },
    { id: 'B', nombre: 'Buenos Aires (GBA/Interior)' },
    { id: 'X', nombre: 'Córdoba' },
    { id: 'S', nombre: 'Santa Fe' },
    { id: 'M', nombre: 'Mendoza' },
    { id: 'E', nombre: 'Entre Ríos' },
    { id: 'T', nombre: 'Tucumán' },
    { id: 'R', nombre: 'Río Negro' },
    { id: 'N', nombre: 'Neuquén' },
    { id: 'Q', nombre: 'Chubut' },
    // Agregá el resto que necesites
];

export default function CalculadoraEnvio({ onSelect }: CalculadoraEnvioProps) {
    const [cp, setCp] = useState('');
    const [provincia, setProvincia] = useState('B');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [opciones, setOpciones] = useState<any[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    // URL DEL BACKEND (Producción)
    const API_URL = 'https://checkout-server-gehy.onrender.com/api/cotizar';

    const calcularEnvio = async (e?: React.MouseEvent | React.FormEvent) => {
        // BLINDAJE CONTRA RECARGAS:
        if (e) {
            e.preventDefault();
            e.stopPropagation(); // Detiene que el evento suba
        }

        if (cp.length < 4) {
            setError("Ingresá un Código Postal válido (4 dígitos).");
            return;
        }

        setLoading(true);
        setError('');
        setOpciones([]);
        setSelectedId(null);
        if (onSelect) onSelect(0, '', '');

        try {
            console.log("Enviando petición a:", API_URL); // Log para debug

            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ codigo_postal: cp, provincia })
            });

            if (!res.ok) {
                // Intentamos leer el error que manda el server
                const errorText = await res.text();
                throw new Error(errorText || "Error de conexión con el servidor.");
            }

            const data = await res.json();
            console.log("Respuesta cotización:", data); // Log para debug

            if (Array.isArray(data) && data.length > 0) {
                // Filtramos solo envíos a Domicilio (modalidad 'D')
                const enviosDomicilio = data.filter((d: any) => d.modalidad === 'D');

                if (enviosDomicilio.length > 0) {
                    setOpciones(enviosDomicilio);
                } else {
                    setError("No encontramos opciones a domicilio para esta ubicación.");
                }
            } else {
                setError("No se encontraron cotizaciones para los datos ingresados.");
            }
        } catch (err: any) {
            console.error("Error en front:", err);
            setError("Hubo un problema al calcular. Intentá de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectOption = (index: number, op: any) => {
        setSelectedId(index);
        if (onSelect) {
            const nombre = `${op.correo.nombre} - ${op.servicio.nombre}`;
            onSelect(op.valor, nombre, cp);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-gray-600" />
                Calculadora de Envíos
            </h3>

            <div className="flex flex-col gap-3 mb-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Tu CP (Ej: 1414)"
                        className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all"
                        value={cp}
                        onChange={e => setCp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault(); // IMPORTANTE
                                e.stopPropagation(); // IMPORTANTE
                                calcularEnvio();
                            }
                        }}
                    />
                    <button
                        type="button" // CRUCIAL: type="button" evita submit
                        onClick={(e) => calcularEnvio(e)}
                        disabled={loading || cp.length < 4}
                        className="bg-black text-[#fff03b] px-6 py-3 rounded-xl font-bold uppercase disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Cotizar'}
                    </button>
                </div>

                <select
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                    value={provincia}
                    onChange={e => setProvincia(e.target.value)}
                >
                    {PROVINCIAS.map(p => (
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                    <option value="B">Otra Provincia (Usar Genérico BsAs)</option>
                </select>
            </div>

            {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg mb-4 flex items-center gap-2 animate-in fade-in">
                    <span className="font-bold">!</span> {error}
                </div>
            )}

            {opciones.length > 0 && (
                <div className="space-y-2 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="text-xs font-bold uppercase text-gray-400 mb-2 tracking-wider">Opciones encontradas:</p>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar pr-1 space-y-2">
                        {opciones.map((op, idx) => (
                            <div
                                key={idx}
                                onClick={() => handleSelectOption(idx, op)}
                                className={`p-4 border rounded-xl cursor-pointer flex justify-between items-center transition-all ${selectedId === idx ? 'border-black bg-yellow-50 ring-1 ring-black' : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <Truck className={`w-5 h-5 ${selectedId === idx ? 'text-black' : 'text-gray-400'}`} />
                                    <div>
                                        <p className="font-bold text-sm text-gray-900">{op.correo.nombre}</p>
                                        <p className="text-xs text-gray-500">{op.servicio.nombre} • {op.horas_entrega}hs</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg">${op.valor}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}