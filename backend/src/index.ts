import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import productDatabase from "../../src/services/productDatabase";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Get all products with optional filters
app.get("/api/productos", async (req, res) => {
  try {
    const { categoria, marca, search, limit, offset } = req.query;
    const filters = {
      categoria: categoria as string,
      marca: marca as string,
      search: search as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    };
    
    const productos = await productDatabase.getProducts(filters);
    res.json(productos);
  } catch (error) {
    console.error("❌ Error al obtener productos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Get product by ID
app.get("/api/productos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await productDatabase.getProductById(id);
    
    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    
    res.json(producto);
  } catch (error) {
    console.error("❌ Error al obtener producto:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Create new product
app.post("/api/productos", async (req, res) => {
  try {
    const producto = await productDatabase.createProduct(req.body);
    res.status(201).json(producto);
  } catch (error) {
    console.error("❌ Error al crear producto:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Update product
app.put("/api/productos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await productDatabase.updateProduct(id, req.body);
    
    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    
    res.json(producto);
  } catch (error) {
    console.error("❌ Error al actualizar producto:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Delete product
app.delete("/api/productos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await productDatabase.deleteProduct(id);
    
    if (!deleted) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error("❌ Error al eliminar producto:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Get products by category
app.get("/api/productos/categoria/:categoria", async (req, res) => {
  try {
    const { categoria } = req.params;
    const productos = await productDatabase.getProductsByCategory(categoria);
    res.json(productos);
  } catch (error) {
    console.error("❌ Error al obtener productos por categoría:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Get products by brand
app.get("/api/productos/marca/:marca", async (req, res) => {
  try {
    const { marca } = req.params;
    const productos = await productDatabase.getProductsByBrand(marca);
    res.json(productos);
  } catch (error) {
    console.error("❌ Error al obtener productos por marca:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Get featured products
app.get("/api/productos/destacados", async (req, res) => {
  try {
    const productos = await productDatabase.getFeaturedProducts();
    res.json(productos);
  } catch (error) {
    console.error("❌ Error al obtener productos destacados:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Update product stock
app.patch("/api/productos/:id/stock", async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;
    
    if (typeof stock !== 'number') {
      return res.status(400).json({ error: "Stock debe ser un número" });
    }
    
    const updated = await productDatabase.updateStock(id, stock);
    
    if (!updated) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    
    res.json({ message: "Stock actualizado correctamente" });
  } catch (error) {
    console.error("❌ Error al actualizar stock:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📦 Endpoints disponibles:`);
  console.log(`   GET    /api/productos - Obtener todos los productos`);
  console.log(`   GET    /api/productos/:id - Obtener producto por ID`);
  console.log(`   POST   /api/productos - Crear nuevo producto`);
  console.log(`   PUT    /api/productos/:id - Actualizar producto`);
  console.log(`   DELETE /api/productos/:id - Eliminar producto`);
  console.log(`   GET    /api/productos/categoria/:categoria - Productos por categoría`);
  console.log(`   GET    /api/productos/marca/:marca - Productos por marca`);
  console.log(`   GET    /api/productos/destacados - Productos destacados`);
  console.log(`   PATCH  /api/productos/:id/stock - Actualizar stock`);
});
