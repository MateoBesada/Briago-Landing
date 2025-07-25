// exportarProductos.ts
import { writeFileSync } from 'fs';
import { Client } from 'pg';

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'productos',
  port: 5432,
});

async function exportarProductos() {
  try {
    await client.connect();
    const res = await client.query('SELECT * FROM productos');
    writeFileSync('productos.json', JSON.stringify(res.rows, null, 2));
    console.log('✅ Productos exportados a productos.json');
  } catch (err) {
    console.error('❌ Error al exportar:', err);
  } finally {
    await client.end();
  }
}

exportarProductos();
