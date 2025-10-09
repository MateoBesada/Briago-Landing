import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mercadopago from 'mercadopago';
import dotenv from 'dotenv';
import { Resend } from 'resend';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const resend = new Resend(process.env.RESEND_API_KEY);

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN,
});

// --- 1. "Base de datos" temporal en memoria para guardar las órdenes ---
const pendingOrders = new Map();

app.post('/create_preference', async (req, res) => {
  try {
    const { items, payer, external_reference } = req.body;

    if (!items || !Array.isArray(items) || !items.length) {
      return res.status(400).json({ error: 'La lista de productos es inválida.' });
    }
    if (!payer || typeof payer.email !== 'string') {
      return res.status(400).json({ error: 'La información del comprador es inválida.' });
    }

    // --- 2. Guardamos los datos completos de la orden antes de crear la preferencia ---
    pendingOrders.set(external_reference, { items, payer });

    const preference = {
      items: items.map(item => ({
        title: String(item.title),
        unit_price: Number(item.unit_price),
        quantity: Number(item.quantity),
        currency_id: 'ARS',
      })),
      payer: {
        name: String(payer.name),
        surname: String(payer.surname),
        email: payer.email,
      },
      back_urls: {
        success: "https://briago-pinturas.com/compra-exitosa",
        failure: "https://briago-pinturas.com/error-en-pago",
        pending: "https://briago-pinturas.com/pago-pendiente",
      },
      auto_return: "approved",
      external_reference: external_reference,
      notification_url: "https://checkout-server-gehy.onrender.com/webhook-mercadopago",
    };

    const result = await mercadopago.preferences.create(preference);
    res.json({ preferenceId: result.body.id });

  } catch (error) {
    console.error('Error al crear preferencia:', error.cause || error.message);
    res.status(500).json({ error: 'Error interno al procesar la solicitud de pago.' });
  }
});

app.post('/webhook-mercadopago', async (req, res) => {
  console.log('Webhook de Mercado Pago recibido');
  
  try {
    if (req.body.type === 'payment') {
      const paymentId = req.body.data?.id;
      const payment = await mercadopago.payment.get(paymentId);
      
      if (payment.body.status === 'approved') {
        const external_reference = payment.body.external_reference;
        console.log(`Pago aprobado para la orden: ${external_reference}`);
        
        // --- 3. Recuperamos los datos de la orden que guardamos ---
        const orderData = pendingOrders.get(external_reference);

        if (orderData) {
          const { items, payer } = orderData;

          const itemsHtml = items.map(item => `
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.title}</td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${Number(item.unit_price).toLocaleString('es-AR')}</td>
            </tr>
          `).join('');

          await resend.emails.send({
            from: 'Tienda Briago <Administracion@briagopinturas.com>',
            to: 'besadamateo@gmail.com',
            subject: `¡Nueva Venta! - Orden #${external_reference}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h1 style="color: #333; text-align: center;">¡Nueva Venta Realizada!</h1>
                <p><strong>Orden:</strong> ${external_reference}</p>
                
                <h2 style="color: #333; border-top: 1px solid #ddd; padding-top: 20px; margin-top: 20px;">Datos del Cliente</h2>
                <p><strong>Nombre:</strong> ${payer.name} ${payer.surname}</p>
                <p><strong>Email:</strong> ${payer.email}</p>
                <p><strong>Teléfono:</strong> ${payer.phone?.number || 'No especificado'}</p>
                
                <h2 style="color: #333; border-top: 1px solid #ddd; padding-top: 20px; margin-top: 20px;">Dirección de Envío</h2>
                <p><strong>Dirección:</strong> ${payer.address?.street_name || 'No especificada'}</p>
                <p><strong>Código Postal:</strong> ${payer.address?.zip_code || 'No especificado'}</p>
                
                <h2 style="color: #333; border-top: 1px solid #ddd; padding-top: 20px; margin-top: 20px;">Detalle del Pedido</h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr>
                      <th style="padding: 8px; border-bottom: 2px solid #333; text-align: left;">Producto</th>
                      <th style="padding: 8px; border-bottom: 2px solid #333; text-align: center;">Cant.</th>
                      <th style="padding: 8px; border-bottom: 2px solid #333; text-align: right;">Precio</th>
                    </tr>
                  </thead>
                  <tbody>${itemsHtml}</tbody>
                </table>
                <h3 style="text-align: right; margin-top: 20px;">Total: $${payment.body.transaction_amount.toLocaleString('es-AR')}</h3>
              </div>
            `,
          });
          console.log('Email de notificación enviado con éxito.');
          pendingOrders.delete(external_reference); // Limpiamos la orden de la memoria
        } else {
          console.error(`No se encontraron datos para la orden: ${external_reference}`);
        }
      }
    }
  } catch (error) {
    console.error('Error al procesar el webhook:', error);
  }
  
  res.status(200).send('OK');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});