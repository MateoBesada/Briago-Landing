import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mercadopago from 'mercadopago';
import dotenv from 'dotenv';

// Carga las variables de entorno del archivo .env
dotenv.config();

const app = express();

// Middlewares
app.use(cors()); // Permite peticiones desde tu frontend
app.use(bodyParser.json());

// Configura Mercado Pago con tu Access Token desde .env
mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN,
});

// --- RUTA PARA CREAR LA PREFERENCIA DE PAGO ---
app.post('/create_preference', async (req, res) => {
  try {
    // Recibimos los 'items' y 'payer' que nos envía el frontend
    const { items, payer, external_reference } = req.body;

    // Medida de seguridad: Validar que los datos existan
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'La lista de productos (items) es inválida.' });
    }

    const preference = {
      items: items.map(item => ({
        title: item.title,
        unit_price: Number(item.unit_price), // Asegurarse de que el precio sea un número
        quantity: Number(item.quantity),     // Asegurarse de que la cantidad sea un número
        currency_id: 'ARS',
      })),
      payer: {
        name: payer.name,
        surname: payer.surname,
        email: payer.email,
        phone: {
          area_code: "54", // Código de área para Argentina
          number: Number(payer.phone.number)
        },
        address: {
          zip_code: payer.address.zip_code,
          street_name: payer.address.street_name,
        }
      },
      back_urls: {
        success: "http://localhost:5173/compra-exitosa", // Cambiá a tu dominio real en producción
        failure: "http://localhost:5173/error-en-pago",
        pending: "http://localhost:5173/pago-pendiente",
      },
      auto_return: "approved",
      external_reference: external_reference,
    };

    const result = await mercadopago.preferences.create(preference);
    res.json({ preferenceId: result.body.id });

  } catch (error) {
    console.error('Error al crear preferencia:', error);
    res.status(500).json({ error: 'Error interno al procesar la solicitud de pago.' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});