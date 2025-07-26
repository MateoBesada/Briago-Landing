import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.PG_USER || "postgres",
  host: process.env.PG_HOST || "localhost",
  database: process.env.PG_DATABASE || "productos",
  port: Number(process.env.PG_PORT) || 5432,
  password: process.env.PG_PASSWORD,
  ssl: process.env.PG_SSL === "true" ? { rejectUnauthorized: false } : false,
});

async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Inicializando base de datos...');
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await client.query(schema);
    console.log('✅ Esquema de base de datos creado correctamente');
    
    // Check if we have existing products
    const result = await client.query('SELECT COUNT(*) FROM productos');
    const count = parseInt(result.rows[0].count);
    
    if (count === 0) {
      console.log('📦 No hay productos existentes. Puedes agregar productos usando la API.');
    } else {
      console.log(`📦 Base de datos inicializada con ${count} productos existentes`);
    }
    
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('🎉 Base de datos inicializada correctamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

export default initializeDatabase;