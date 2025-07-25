import { Link } from "react-router-dom";

const categorias = [
  { id: 1, nombre: "HOGAR Y OBRA", link: "/productos-pinturas" },
  { id: 2, nombre: "AUTOMOTOR", link: "/productos-automotor" },
  { id: 3, nombre: "INDUSTRIA", link: "#productos-Industria" },
  { id: 4, nombre: "PULIDOS", link: "/productos-pulidos" },
  { id: 5, nombre: "ABRASIVOS", link: "/productos-abrasivos" },
  { id: 6, nombre: "ACCESORIOS", link: "/productos-accesorios" },
];

const Secciones = () => {
  return (
    <section
      id="productos"
      className="scroll-mt-20 bg-white pt-10 pb-8 font-gotham"
    >
      <div className="w-full max-w-screen-7xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
        {categorias.map((cat) => (
          <CategoriaCard key={cat.id} cat={cat} />
        ))}
      </div>
    </section>
  );
};

const CategoriaCard = ({ cat }: { cat: { nombre: string; link: string } }) => {
  return (
    <Wrapper
      to={cat.link.startsWith("/") ? cat.link : undefined}
      href={!cat.link.startsWith("/") ? cat.link : undefined}
      className="group transition-transform duration-300 hover:-translate-y-2"
    >
      <div className="bg-[#fff03b] py-5 px-2 text-black text-xl font-bold uppercase text-center tracking-wide rounded-xl shadow-lg hover:shadow-xl border border-transparent group-hover:border-black transition duration-300 hover:bg-[#fce12b]">
        {cat.nombre}
      </div>
    </Wrapper>
  );
};

type WrapperProps = {
  to?: string;
  href?: string;
  className?: string;
  children: React.ReactNode;
};

const Wrapper = ({ to, href, className, children }: WrapperProps) => {
  return to ? (
    <Link to={to} className={className}>
      {children}
    </Link>
  ) : (
    <a href={href} className={className}>
      {children}
    </a>
  );
};

export default Secciones;
