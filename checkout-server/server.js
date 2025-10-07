import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mercadopago from 'mercadopago';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Configura Mercado Pago con tu Access Token desde .env
mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN,
});

// --- RUTA PARA CREAR LA PREFERENCIA DE PAGO ---
app.post('/create_preference', async (req, res) => {
  try {
    // Recibimos los datos del frontend
    const { items, payer, external_reference } = req.body;

    // Medidas de seguridad y validación
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'La lista de productos (items) es inválida.' });
    }
    if (!payer || typeof payer.email !== 'string') {
        return res.status(400).json({ error: 'La información del comprador (payer) es inválida.' });
    }

    const preference = {
      items: items.map(item => ({
        title: String(item.title),
        unit_price: Number(item.unit_price),
        quantity: Number(item.quantity),
        currency_id: 'ARS',
      })),
      payer: {
        name: String(payer.name || ''),
        surname: String(payer.surname || ''),
        email: payer.email,
        phone: {
          area_code: "54",
          number: Number(payer.phone?.number) || 0
        },
        address: {
          zip_code: String(payer.address?.zip_code || ''),
          street_name: String(payer.address?.street_name || ''),
        }
      },
      back_urls: {
        // IMPORTANTE: Reemplazá 'tu-sitio.com' con tu dominio real de Render
        success: "https://briago-pinturas.com/compra-exitosa",
        failure: "https://briago-pinturas.com/error-en-pago",
        pending: "https://briago-pinturas.com/pago-pendiente",
      },
      auto_return: "approved",
      external_reference: external_reference,
    };

    const result = await mercadopago.preferences.create(preference);
    res.json({ preferenceId: result.body.id });

  } catch (error) {
    console.error('Error al crear preferencia:', error.cause || error.message);
    res.status(500).json({ error: 'Error interno al procesar la solicitud de pago.' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});