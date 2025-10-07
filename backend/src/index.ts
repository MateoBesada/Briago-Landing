import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

app.get("/api/productos", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM productos1");
    res.json(rows);
  } catch (error) {
    console.error("❌ Error al obtener productos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📦 Endpoint disponible en http://localhost:${PORT}/api/productos`);
});
