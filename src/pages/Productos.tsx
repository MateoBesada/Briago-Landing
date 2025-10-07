import { useEffect, useState } from "react";

type Producto = {
  id: number;
  nombre: string;
  precio: number;
  
};

const ProductosDesdeDB = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch("/api/productos")
      .then((res) => res.json())
      .then((data) => {
        setProductos(data);
        setCargando(false);
      })
      .catch((err) => {
        console.error("Error al obtener productos:", err);
        setCargando(false);
      });
  }, []);

  if (cargando) {
    return <p className="p-4">Cargando productos...</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Productos desde la Base de Datos</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {productos.map((producto) => (
          <div key={producto.id} className="border rounded p-4 bg-white shadow">
            <h2 className="text-lg font-semibold">{producto.nombre}</h2>
            <p className="text-gray-600">${producto.precio}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductosDesdeDB;
