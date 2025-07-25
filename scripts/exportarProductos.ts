// scripts/exportarProductos.ts

import fs from "fs";
import path from "path";
import { productosPinturas } from "../src/data/Pinturas"; // ajustá la ruta según tu estructura

interface ProductoPlano {
  id: string;
  nombre: string;
  descripcion: string;
  precioOriginal?: number;
  off?: number;
  imagen: string;
  categoria: string;
  marca: string;
  capacidad?: string;
}

function convertirAPlano(productos: any[]): ProductoPlano[] {
  const resultado: ProductoPlano[] = [];

  for (const producto of productos) {
    // Producto principal
    resultado.push({
      id: producto.id,
      nombre: producto.nombre,
      descripcion: producto.descripcion || "",
      precioOriginal: producto.precioOriginal || "",
      off: producto.off || "",
      imagen: producto.imagen,
      categoria: producto.categoria,
      marca: producto.marca,
      capacidad: producto.capacidad || "",
    });

    // Variantes
    if (producto.variantes && Array.isArray(producto.variantes)) {
      for (const variante of producto.variantes) {
        resultado.push({
          id: variante.id,
          nombre: variante.nombre,
          descripcion: variante.descripcion || "",
          precioOriginal: variante.precioOriginal || "",
          off: variante.off || "",
          imagen: variante.imagen,
          categoria: variante.categoria,
          marca: variante.marca,
          capacidad: variante.capacidad || "",
        });
      }
    }
  }

  return resultado;
}

function generarCSV(datos: ProductoPlano[]) {
  const encabezado = [
    "id",
    "nombre",
    "descripcion",
    "precioOriginal",
    "off",
    "imagen",
    "categoria",
    "marca",
    "capacidad",
  ];

  const filas = datos.map((p) =>
    encabezado
      .map((key) =>
        `"${(p as any)[key]?.toString().replace(/"/g, '""') || ""}"`
      )
      .join(",")
  );

  return [encabezado.join(","), ...filas].join("\n");
}

function exportar() {
  const planos = convertirAPlano(productosPinturas);
  const csv = generarCSV(planos);
  const ruta = path.join(__dirname, "../productos_pinturas.csv");
  fs.writeFileSync(ruta, csv, "utf-8");
  console.log("✅ Archivo CSV generado en:", ruta);
}

exportar();