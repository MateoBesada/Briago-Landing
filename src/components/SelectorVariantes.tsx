import { useEffect, useState } from "react";
import clsx from "clsx";

type Variante = {
  id: string;
  nombre: string;
  color?: string;
  acabado?: string;
  capacidad?: string;
  grano?: string;
  kilos?: string;
};

type Props = {
  variantes: Variante[];
  productoActualId: string;
  onSeleccionar: (id: string) => void;
};

const SelectorVariantes = ({ variantes, productoActualId, onSeleccionar }: Props) => {
  const actual = variantes.find((v) => v.id === productoActualId);

  const [colorSeleccionado, setColorSeleccionado] = useState<string | undefined>(
    actual?.color?.toLowerCase()
  );
  const [acabadoSeleccionado, setAcabadoSeleccionado] = useState<string | undefined>(
    actual?.acabado?.toLowerCase()
  );
  const [capacidadSeleccionada, setCapacidadSeleccionada] = useState<string | undefined>(
    actual?.capacidad
  );
  const [granoSeleccionado, setGranoSeleccionado] = useState<string | undefined>(
    actual?.grano
  );
  const [kilosSeleccionado, setKilosSeleccionado] = useState<string | undefined>(
    actual?.kilos
  );

  // Sincroniza los estados locales con la variante actual cada vez que cambia productoActualId
useEffect(() => {
  const actual = variantes.find((v) => v.id === productoActualId);
  setColorSeleccionado(actual?.color?.toLowerCase());
  setAcabadoSeleccionado(actual?.acabado?.toLowerCase());
  setCapacidadSeleccionada(actual?.capacidad);
  setGranoSeleccionado(actual?.grano);
  setKilosSeleccionado(actual?.kilos);
}, [productoActualId]);

// Detecta si se seleccionó una combinación distinta y cambia de variante si corresponde
useEffect(() => {
  if (!colorSeleccionado && !acabadoSeleccionado && !capacidadSeleccionada && !granoSeleccionado && !kilosSeleccionado) return;

  const nuevaVariante = variantes.find((v) =>
    (!colorSeleccionado || v.color?.toLowerCase() === colorSeleccionado) &&
    (!acabadoSeleccionado || v.acabado?.toLowerCase() === acabadoSeleccionado) &&
    (!capacidadSeleccionada || v.capacidad === capacidadSeleccionada) &&
    (!granoSeleccionado || v.grano === granoSeleccionado) &&
    (!kilosSeleccionado || v.kilos === kilosSeleccionado)
  );

  if (nuevaVariante && nuevaVariante.id !== productoActualId) {
    onSeleccionar(nuevaVariante.id);
  }
}, [colorSeleccionado, acabadoSeleccionado, capacidadSeleccionada, granoSeleccionado, kilosSeleccionado]);

// Valores únicos para mostrar botones
const coloresUnicos = Array.from(
  new Set(variantes.map((v) => v.color?.toLowerCase()).filter(Boolean))
);
const acabadosUnicos = Array.from(
  new Set(variantes.map((v) => v.acabado?.toLowerCase()).filter(Boolean))
);
const capacidadesUnicas = Array.from(
  new Set(variantes.map((v) => v.capacidad).filter(Boolean))
);
const granosUnicos = Array.from(
  new Set(variantes.map((v) => v.grano).filter(Boolean))
);
const kilosUnicos = Array.from(
  new Set(variantes.map((v) => v.kilos).filter(Boolean))
);

// Mostrar solo los selectores necesarios
const mostrarColor = coloresUnicos.length > 1;
const mostrarAcabado = acabadosUnicos.length > 1;
const mostrarCapacidad = capacidadesUnicas.length > 1;
const mostrarGrano = granosUnicos.length > 1;
const mostrarKilos = kilosUnicos.length > 1;

if (!mostrarColor && !mostrarAcabado && !mostrarCapacidad && !mostrarGrano && !mostrarKilos) return null;

const hayFiltros = !!(
  colorSeleccionado ||
  acabadoSeleccionado ||
  capacidadSeleccionada ||
  granoSeleccionado ||
  kilosSeleccionado
);

return (
  <div className="flex flex-col gap-4 bg-gray-50 p-4 rounded-xl border text-sm shadow-sm">
    {mostrarAcabado && (
      <div>
        <p className="font-semibold text-gray-800 mb-2">Acabado:</p>
        <div className="flex gap-2 flex-wrap">
          {acabadosUnicos.map((a) => {
            const disponible = variantes.some(
              (v) =>
                (!colorSeleccionado || v.color?.toLowerCase() === colorSeleccionado) &&
                (!capacidadSeleccionada || v.capacidad === capacidadSeleccionada) &&
                (!granoSeleccionado || v.grano === granoSeleccionado) &&
                (!kilosSeleccionado || v.kilos === kilosSeleccionado) &&
                v.acabado?.toLowerCase() === a
            );
            return (
              <button
                key={a}
                onClick={() =>
                  disponible &&
                  setAcabadoSeleccionado((prev) => (prev === a ? undefined : a))
                }
                disabled={!disponible}
                className={clsx(
                  "px-4 py-1 rounded-full border font-medium capitalize transition",
                  a === acabadoSeleccionado
                    ? "bg-yellow-300 border-yellow-500 text-black shadow"
                    : !disponible
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white hover:border-yellow-400"
                )}
              >
                {a}
              </button>
            );
          })}
        </div>
      </div>
    )}

    {mostrarColor && (
      <div>
        <p className="font-semibold text-gray-800 mb-2">Color:</p>
        <div className="flex gap-2 flex-wrap">
          {coloresUnicos.map((c) => {
            const disponible = variantes.some(
              (v) =>
                (!acabadoSeleccionado || v.acabado?.toLowerCase() === acabadoSeleccionado) &&
                (!capacidadSeleccionada || v.capacidad === capacidadSeleccionada) &&
                (!granoSeleccionado || v.grano === granoSeleccionado) &&
                (!kilosSeleccionado || v.kilos === kilosSeleccionado) &&
                v.color?.toLowerCase() === c
            );
            return (
              <button
                key={c}
                onClick={() =>
                  disponible &&
                  setColorSeleccionado((prev) => (prev === c ? undefined : c))
                }
                disabled={!disponible}
                className={clsx(
                  "px-4 py-1 rounded-full border font-medium capitalize transition",
                  c === colorSeleccionado
                    ? "bg-yellow-300 border-yellow-500 text-black shadow"
                    : !disponible
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white hover:border-yellow-400"
                )}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>
    )}

    {mostrarGrano && (
      <div>
        <p className="font-semibold text-gray-800 mb-2">Grano:</p>
        <div className="flex gap-2 flex-wrap">
          {granosUnicos.map((g) => {
            const disponible = variantes.some(
              (v) =>
                (!colorSeleccionado || v.color?.toLowerCase() === colorSeleccionado) &&
                (!acabadoSeleccionado || v.acabado?.toLowerCase() === acabadoSeleccionado) &&
                (!capacidadSeleccionada || v.capacidad === capacidadSeleccionada) &&
                (!kilosSeleccionado || v.kilos === kilosSeleccionado) &&
                v.grano === g
            );
            return (
              <button
                key={g}
                onClick={() =>
                  disponible &&
                  setGranoSeleccionado((prev) => (prev === g ? undefined : g))
                }
                disabled={!disponible}
                className={clsx(
                  "px-4 py-1 rounded-full border font-medium capitalize transition",
                  g === granoSeleccionado
                    ? "bg-yellow-300 border-yellow-500 text-black shadow"
                    : !disponible
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white hover:border-yellow-400"
                )}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>
    )}

    {mostrarKilos && (
      <div>
        <p className="font-semibold text-gray-800 mb-2">Kilos:</p>
        <div className="flex gap-2 flex-wrap">
          {kilosUnicos.map((k) => {
            const disponible = variantes.some(
              (v) =>
                (!colorSeleccionado || v.color?.toLowerCase() === colorSeleccionado) &&
                (!acabadoSeleccionado || v.acabado?.toLowerCase() === acabadoSeleccionado) &&
                (!capacidadSeleccionada || v.capacidad === capacidadSeleccionada) &&
                (!granoSeleccionado || v.grano === granoSeleccionado) &&
                v.kilos === k
            );
            return (
              <button
                key={k}
                onClick={() =>
                  disponible &&
                  setKilosSeleccionado((prev) => (prev === k ? undefined : k))
                }
                disabled={!disponible}
                className={clsx(
                  "px-4 py-1 rounded-full border font-medium capitalize transition",
                  k === kilosSeleccionado
                    ? "bg-yellow-300 border-yellow-500 text-black shadow"
                    : !disponible
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white hover:border-yellow-400"
                )}
              >
                {k}
              </button>
            );
          })}
        </div>
      </div>
    )}

    {mostrarCapacidad && (
      <div>
        <p className="font-semibold text-gray-800 mb-2">Litros:</p>
        <div className="flex gap-2 flex-wrap">
          {capacidadesUnicas
            .sort((a, b) => parseInt(b!) - parseInt(a!))
            .map((cap) => {
              const disponible = variantes.some(
                (v) =>
                  (!colorSeleccionado || v.color?.toLowerCase() === colorSeleccionado) &&
                  (!acabadoSeleccionado || v.acabado?.toLowerCase() === acabadoSeleccionado) &&
                  (!granoSeleccionado || v.grano === granoSeleccionado) &&
                  (!kilosSeleccionado || v.kilos === kilosSeleccionado) &&
                  v.capacidad === cap
              );
              return (
                <button
                  key={cap}
                  onClick={() =>
                    disponible &&
                    setCapacidadSeleccionada((prev) => (prev === cap ? undefined : cap))
                  }
                  disabled={!disponible}
                  className={clsx(
                    "px-4 py-1 rounded-full border font-medium transition",
                    cap === capacidadSeleccionada
                      ? "bg-yellow-300 border-yellow-500 text-black shadow"
                      : !disponible
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white hover:border-yellow-400"
                  )}
                >
                  {cap} L
                </button>
              );
            })}
        </div>
      </div>
    )}
    {hayFiltros && (
  <button
    onClick={() => {
      setColorSeleccionado(undefined);
      setAcabadoSeleccionado(undefined);
      setCapacidadSeleccionada(undefined);
      setGranoSeleccionado(undefined);
      setKilosSeleccionado(undefined);
    }}
    className="self-start mt-2 text-sm text-blue-600 hover:underline"
  >
    Quitar filtros
  </button>
)}
  </div>
);
}

export default SelectorVariantes;
