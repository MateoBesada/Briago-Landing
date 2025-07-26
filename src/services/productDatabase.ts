import pool from '../../db';
import { Producto } from '../types/Producto';

export class ProductDatabase {
  // Create a new product
  async createProduct(producto: Omit<Producto, 'id'>): Promise<Producto> {
    const client = await pool.connect();
    try {
      const query = `
        INSERT INTO productos (
          nombre, marca, categoria, imagen, descripcion, producto, img_opcionales,
          imagen_hover, imagenes, capacidad, abrasivo, acabado, color, grano, kilos,
          precio_original, precio, off, precio_final, precio_unidad, stock_unidad,
          precio_caja, unidades_por_caja, stock_caja, es_nuevo, mas_vendido, stock,
          rating, reviews_count, especificaciones
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
          $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30
        ) RETURNING *
      `;
      
      const values = [
        producto.nombre,
        producto.marca,
        producto.categoria,
        producto.imagen,
        producto.descripcion || null,
        producto.producto || null,
        producto.imgOpcionales || null,
        producto.imagenHover || null,
        producto.imagenes || null,
        producto.capacidad || null,
        producto.abrasivo || null,
        producto.acabado || null,
        producto.color || null,
        producto.grano || null,
        producto.kilos || null,
        producto.precioOriginal || null,
        producto.precio || null,
        producto.off || null,
        producto.precioFinal || null,
        producto.tipoVenta?.unidad?.precio || null,
        producto.tipoVenta?.unidad?.stock || null,
        producto.tipoVenta?.caja?.precio || null,
        producto.tipoVenta?.caja?.unidadesPorCaja || null,
        producto.tipoVenta?.caja?.stock || null,
        producto.esNuevo || false,
        producto.masVendido || false,
        producto.stock || 0,
        producto.rating || null,
        producto.reviewsCount || 0,
        JSON.stringify(producto.especificaciones) || null
      ];

      const result = await client.query(query, values);
      return this.mapRowToProduct(result.rows[0]);
    } finally {
      client.release();
    }
  }

  // Get all products with optional filters
  async getProducts(filters?: {
    categoria?: string;
    marca?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Producto[]> {
    const client = await pool.connect();
    try {
      let query = 'SELECT * FROM productos WHERE 1=1';
      const values: any[] = [];
      let paramCounter = 1;

      if (filters?.categoria) {
        query += ` AND categoria = $${paramCounter}`;
        values.push(filters.categoria);
        paramCounter++;
      }

      if (filters?.marca) {
        query += ` AND marca = $${paramCounter}`;
        values.push(filters.marca);
        paramCounter++;
      }

      if (filters?.search) {
        query += ` AND (nombre ILIKE $${paramCounter} OR descripcion ILIKE $${paramCounter})`;
        values.push(`%${filters.search}%`);
        paramCounter++;
      }

      query += ' ORDER BY created_at DESC';

      if (filters?.limit) {
        query += ` LIMIT $${paramCounter}`;
        values.push(filters.limit);
        paramCounter++;
      }

      if (filters?.offset) {
        query += ` OFFSET $${paramCounter}`;
        values.push(filters.offset);
      }

      const result = await client.query(query, values);
      return result.rows.map(row => this.mapRowToProduct(row));
    } finally {
      client.release();
    }
  }

  // Get product by ID
  async getProductById(id: string): Promise<Producto | null> {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM productos WHERE id = $1', [id]);
      if (result.rows.length === 0) return null;
      return this.mapRowToProduct(result.rows[0]);
    } finally {
      client.release();
    }
  }

  // Update product
  async updateProduct(id: string, updates: Partial<Producto>): Promise<Producto | null> {
    const client = await pool.connect();
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let paramCounter = 1;

      // Build dynamic update query
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
          const dbField = this.mapProductFieldToDb(key);
          if (dbField) {
            if (key === 'especificaciones') {
              fields.push(`${dbField} = $${paramCounter}`);
              values.push(JSON.stringify(value));
            } else if (key === 'tipoVenta') {
              // Handle tipoVenta object specially
              if (value && typeof value === 'object') {
                const tipoVenta = value as any;
                if (tipoVenta.unidad) {
                  fields.push(`precio_unidad = $${paramCounter}`);
                  values.push(tipoVenta.unidad.precio);
                  paramCounter++;
                  fields.push(`stock_unidad = $${paramCounter}`);
                  values.push(tipoVenta.unidad.stock);
                  paramCounter++;
                }
                if (tipoVenta.caja) {
                  fields.push(`precio_caja = $${paramCounter}`);
                  values.push(tipoVenta.caja.precio);
                  paramCounter++;
                  fields.push(`unidades_por_caja = $${paramCounter}`);
                  values.push(tipoVenta.caja.unidadesPorCaja);
                  paramCounter++;
                  fields.push(`stock_caja = $${paramCounter}`);
                  values.push(tipoVenta.caja.stock);
                }
              }
            } else {
              fields.push(`${dbField} = $${paramCounter}`);
              values.push(value);
            }
            paramCounter++;
          }
        }
      });

      if (fields.length === 0) return null;

      const query = `
        UPDATE productos 
        SET ${fields.join(', ')} 
        WHERE id = $${paramCounter} 
        RETURNING *
      `;
      values.push(id);

      const result = await client.query(query, values);
      if (result.rows.length === 0) return null;
      return this.mapRowToProduct(result.rows[0]);
    } finally {
      client.release();
    }
  }

  // Delete product
  async deleteProduct(id: string): Promise<boolean> {
    const client = await pool.connect();
    try {
      const result = await client.query('DELETE FROM productos WHERE id = $1', [id]);
      return result.rowCount !== null && result.rowCount > 0;
    } finally {
      client.release();
    }
  }

  // Get products by category
  async getProductsByCategory(categoria: string): Promise<Producto[]> {
    return this.getProducts({ categoria });
  }

  // Get products by brand
  async getProductsByBrand(marca: string): Promise<Producto[]> {
    return this.getProducts({ marca });
  }

  // Search products
  async searchProducts(searchTerm: string): Promise<Producto[]> {
    return this.getProducts({ search: searchTerm });
  }

  // Get featured products (nuevos or mas vendidos)
  async getFeaturedProducts(): Promise<Producto[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM productos WHERE es_nuevo = true OR mas_vendido = true ORDER BY created_at DESC LIMIT 20'
      );
      return result.rows.map(row => this.mapRowToProduct(row));
    } finally {
      client.release();
    }
  }

  // Update stock
  async updateStock(id: string, stock: number): Promise<boolean> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'UPDATE productos SET stock = $1 WHERE id = $2',
        [stock, id]
      );
      return result.rowCount !== null && result.rowCount > 0;
    } finally {
      client.release();
    }
  }

  // Map database row to Producto interface
  private mapRowToProduct(row: any): Producto {
    return {
      id: row.id,
      nombre: row.nombre,
      marca: row.marca,
      categoria: row.categoria,
      imagen: row.imagen,
      descripcion: row.descripcion,
      producto: row.producto,
      imgOpcionales: row.img_opcionales,
      imagenHover: row.imagen_hover,
      imagenes: row.imagenes,
      capacidad: row.capacidad,
      abrasivo: row.abrasivo,
      acabado: row.acabado,
      color: row.color,
      grano: row.grano,
      kilos: row.kilos,
      tipoVenta: {
        unidad: row.precio_unidad ? {
          precio: parseFloat(row.precio_unidad),
          stock: row.stock_unidad
        } : undefined,
        caja: row.precio_caja ? {
          precio: parseFloat(row.precio_caja),
          unidadesPorCaja: row.unidades_por_caja,
          stock: row.stock_caja
        } : undefined
      },
      precioOriginal: row.precio_original ? parseFloat(row.precio_original) : undefined,
      precio: row.precio ? parseFloat(row.precio) : undefined,
      off: row.off,
      precioFinal: row.precio_final ? parseFloat(row.precio_final) : undefined,
      esNuevo: row.es_nuevo,
      masVendido: row.mas_vendido,
      stock: row.stock,
      rating: row.rating ? parseFloat(row.rating) : undefined,
      reviewsCount: row.reviews_count,
      especificaciones: row.especificaciones ? JSON.parse(row.especificaciones) : undefined
    };
  }

  // Map Producto field names to database column names
  private mapProductFieldToDb(field: string): string | null {
    const fieldMap: Record<string, string> = {
      nombre: 'nombre',
      marca: 'marca',
      categoria: 'categoria',
      imagen: 'imagen',
      descripcion: 'descripcion',
      producto: 'producto',
      imgOpcionales: 'img_opcionales',
      imagenHover: 'imagen_hover',
      imagenes: 'imagenes',
      capacidad: 'capacidad',
      abrasivo: 'abrasivo',
      acabado: 'acabado',
      color: 'color',
      grano: 'grano',
      kilos: 'kilos',
      precioOriginal: 'precio_original',
      precio: 'precio',
      off: 'off',
      precioFinal: 'precio_final',
      esNuevo: 'es_nuevo',
      masVendido: 'mas_vendido',
      stock: 'stock',
      rating: 'rating',
      reviewsCount: 'reviews_count',
      especificaciones: 'especificaciones'
    };
    return fieldMap[field] || null;
  }
}

export default new ProductDatabase();