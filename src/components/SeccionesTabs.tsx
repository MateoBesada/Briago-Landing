import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";

const SECCIONES = [
  { label: "HOGAR Y OBRA", to: "/productos-pinturas" },
  { label: "AUTOMOTOR", to: "/productos-automotor" },
  { label: "INDUSTRIA", to: "#productos-industria" },
  { label: "PULIDOS", to: "/productos-pulidos" },
  { label: "ABRASIVOS", to: "/productos-abrasivos" },
  { label: "ACCESORIOS", to: "/productos-accesorios" },
];

export default function SeccionesTabs() {
  const { pathname } = useLocation();

  return (
    <div className="w-full max-w-7xl mx-auto mb-6 relative z-20">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {SECCIONES.map(({ label, to }) => {
          const active = pathname === to;
          return (
            <Link
              key={label}
              to={to}
              className={clsx(
                "w-full text-center rounded-xl py-4 font-extrabold uppercase tracking-wide transition shadow-sm",
                "bg-[#fff03b] text-black hover:shadow-md hover:ring-2 hover:ring-[#fff03b]",
                active && "ring-3 ring-[#fce11b] ring-offset-3 bg-[#fce11b] ",
              )}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
