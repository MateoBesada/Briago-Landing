export interface Producto {
  id: string;
  nombre: string;
  marca: string;
  categoria: string;
  imagen: string;
  descripcion?: string;
  producto?: string;
  imgOpcionales?: string[];
  seccion?: string; // Sección del producto (ej: "Abrasivos", "Accesorios")

  // Galería de imágenes
  imagenHover?: string;
  imagenes?: string[];

  // Variantes del producto
  variantes?: Producto[];

  // Atributos de variantes
  capacidad?: string;      // Ej: "1", "4", "20" (litros)
  abrasivo?: string;       // Ej: "Grano 120", "Grano 1500"
  acabado?: string;      // Ej: "Brillante", "Satinado", "Mate"
  color?: string;          // Ej: "Rojo Fuego" (Para Látex y otros)
  
  // --- CAMBIO AQUÍ ---
  ColorAerosol?: string; // Ej: "Rojo Fuego" (Específico para Aerosoles)
  
  colorHex?: string;       // Ej: "#c50000" (para mostrar el círculo de color)
  grano?: string;          // Ej: "2000", "3000" (para abrasivos)  
  kilos?: string;          // Ej: "1kg", "5kg" (para productos en peso)

  tipoVenta?: {
    unidad?: {
      precio: number;
      stock?: number;
    };
    caja?: {
      precio: number;
      unidadesPorCaja: number;
      stock?: number;
    };
  };

  // Precios
  precioOriginal?: number;
  precio?: number;
  off?: number;
  precioFinal?: number;

  // Flags UX
  esNuevo?: boolean;
  masVendido?: boolean;
  stock?: number;

  // Opiniones
  rating?: number;
  reviewsCount?: number;

  // Ficha técnica
  especificaciones?: Record<string, string>;
}