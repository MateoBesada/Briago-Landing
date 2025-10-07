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

app.post('/create_preference', async (req, res) => {
  try {
    const { items, payer, external_reference } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'La lista de productos (items) es inválida.' });
    }
    if (!payer || typeof payer.email !== 'string') {
      return res.status(400).json({ error: 'La información del comprador (payer) es inválida.' });
    }

    const preference = {
      items: items.map(item => ({
        title: String(item.title || 'Producto'),
        unit_price: Number(item.unit_price) || 0,
        quantity: Number(item.quantity) || 1,
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
    console.error('Error al crear preferencia:', error.cause ? error.cause : error);
    res.status(500).json({ error: 'Error interno al procesar la solicitud de pago.' });
  }
});

app.post('/webhook-mercadopago', async (req, res) => {
  console.log('Webhook de Mercado Pago recibido');
  const paymentId = req.body.data?.id;

  if (req.body.type === 'payment' && paymentId) {
    try {
      const payment = await mercadopago.payment.get(paymentId);
      
      if (payment.body.status === 'approved') {
        console.log('Pago aprobado. Enviando email de notificación...');
        
        const itemsHtml = payment.body.additional_info.items.map(item => `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.title}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${Number(item.unit_price).toLocaleString('es-AR')}</td>
          </tr>
        `).join('');

        await resend.emails.send({
          from: 'Tienda Briago <Administracion@briagopinturas.com>',
          to: 'besadamateo@gmail.com',
          subject: `¡Nueva Venta! - Orden #${payment.body.external_reference}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
              <h1 style="color: #333; text-align: center;">¡Nueva Venta Realizada!</h1>
              <p><strong>Orden:</strong> ${payment.body.external_reference}</p>
              <p><strong>Comprador:</strong> ${payment.body.payer.first_name || ''} ${payment.body.payer.last_name || ''}</p>
              <p><strong>Email:</strong> ${payment.body.payer.email}</p>
              <h2 style="color: #333; border-top: 1px solid #ddd; padding-top: 20px; margin-top: 20px;">Detalle del Pedido</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr>
                    <th style="padding: 8px; border-bottom: 2px solid #333; text-align: left;">Producto</th>
                    <th style="padding: 8px; border-bottom: 2px solid #333; text-align: center;">Cant.</th>
                    <th style="padding: 8px; border-bottom: 2px solid #333; text-align: right;">Precio</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
              <h3 style="text-align: right; margin-top: 20px;">Total: $${payment.body.transaction_amount.toLocaleString('es-AR')}</h3>
            </div>
          `,
        });

        console.log('Email de notificación enviado con éxito.');
      }
    } catch (error) {
      console.error('Error al procesar el webhook:', error);
    }
  }

  res.status(200).send('OK');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});