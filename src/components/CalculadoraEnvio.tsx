import React, { useState } from 'react';
import { Loader2, Truck } from 'lucide-react';

interface CalculadoraEnvioProps {
    onSelect?: (costo: number, detalle: string, cp: string) => void;
}

// CORRECCIÓN: EnvíoPack necesita los nombres exactos, no letras.
const PROVINCIAS = [
    { valor: 'Capital Federal', label: 'Capital Federal (CABA)' },
    { valor: 'Buenos Aires', label: 'Buenos Aires (GBA/Interior)' },
    { valor: 'Córdoba', label: 'Córdoba' },
    { valor: 'Santa Fe', label: 'Santa Fe' },
    { valor: 'Mendoza', label: 'Mendoza' },
    { valor: 'Entre Ríos', label: 'Entre Ríos' },
    { valor: 'Tucumán', label: 'Tucumán' },
    // Puedes agregar más, pero el "valor" debe ser el nombre real de la provincia
];

export default function CalculadoraEnvio({ onSelect }: CalculadoraEnvioProps) {
    const [cp, setCp] = useState('');
    // Default: Buenos Aires (Nombre completo)
    const [provincia, setProvincia] = useState('Buenos Aires');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [opciones, setOpciones] = useState<any[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    // URL DE TU BACKEND EN RENDER
    const API_URL = 'https://checkout-server-gehy.onrender.com/api/cotizar';

    const calcularEnvio = async (e: React.FormEvent) => {
        e.preventDefault();

        if (cp.length < 4) {
            setError("El código postal parece incompleto.");
            return;
        }

        setLoading(true);
        setError('');
        setOpciones([]);
        setSelectedId(null);
        if (onSelect) onSelect(0, '', '');

        try {
            // Enviamos el nombre completo de la provincia
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ codigo_postal: cp, provincia })
            });

            if (!res.ok) throw new Error("Error de conexión con el servidor.");

            const data = await res.json();

            // Validación robusta de la respuesta
            if (Array.isArray(data) && data.length > 0) {
                // Filtramos solo envíos a Domicilio ('D')
                const enviosDomicilio = data.filter((d: any) => d.modalidad === 'D');

                if (enviosDomicilio.length > 0) {
                    setOpciones(enviosDomicilio);
                } else {
                    setError("No encontramos envíos a domicilio para esta zona.");
                }
            } else {
                setError("No se encontraron opciones de envío. Verificá el CP.");
            }
        } catch (err) {
            console.error(err);
            setError("Error al calcular. Verificá tu CP y Provincia.");
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
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5" /> Calcular Envío
            </h3>

            <form onSubmit={calcularEnvio} className="flex gap-2 mb-4">
                <input
                    type="text"
                    placeholder="Tu CP (Ej: 1629)"
                    className="flex-1 p-3 border rounded-xl focus:ring-2 focus:ring-black outline-none transition-all"
                    value={cp}
                    onChange={e => setCp(e.target.value)}
                />
                <button
                    type="submit"
                    disabled={loading || !cp}
                    className="bg-black text-[#fff03b] px-6 py-3 rounded-xl font-bold uppercase disabled:opacity-50 hover:bg-gray-800 transition-colors"
                >
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Calcular'}
                </button>
            </form>

            <div className="mb-4">
                <select
                    className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm"
                    value={provincia}
                    onChange={e => setProvincia(e.target.value)}
                >
                    {PROVINCIAS.map(p => (
                        // USAMOS p.valor AQUÍ PARA QUE ENVÍE EL NOMBRE COMPLETO
                        <option key={p.valor} value={p.valor}>{p.label}</option>
                    ))}
                    <option value="Buenos Aires">Otras Provincias</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">* Seleccioná tu provincia correctamente</p>
            </div>

            {error && <p className="text-red-500 text-sm font-medium mb-4">{error}</p>}

            {opciones.length > 0 && (
                <div className="space-y-2 mt-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <p className="text-xs font-bold uppercase text-gray-500 mb-2">Opciones disponibles:</p>
                    {opciones.map((op, idx) => (
                        <div
                            key={idx}
                            onClick={() => handleSelectOption(idx, op)}
                            className={`p-3 border rounded-xl cursor-pointer flex justify-between items-center transition-all ${selectedId === idx ? 'border-black bg-white ring-1 ring-black shadow-md' : 'border-gray-200 bg-white hover:border-gray-400'}`}
                        >
                            <div>
                                <p className="font-bold text-sm">{op.correo.nombre}</p>
                                <p className="text-xs text-gray-500">{op.servicio.nombre} ({op.horas_entrega}hs)</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-lg">${op.valor}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}