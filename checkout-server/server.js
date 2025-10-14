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

const pendingOrders = new Map();

// [SIN CAMBIOS] Tu endpoint para crear la preferencia se mantiene igual.
app.post('/create_preference', async (req, res) => {
  try {
    const { items, payer, external_reference } = req.body;
    if (!items || !Array.isArray(items) || !items.length) {
      return res.status(400).json({ error: 'La lista de productos es inválida.' });
    }
    if (!payer || typeof payer.email !== 'string') {
      return res.status(400).json({ error: 'La información del comprador es inválida.' });
    }
    pendingOrders.set(external_reference, { items, payer });
    const preference = {
      items: items.map(item => ({
        title: String(item.title),
        unit_price: Number(item.unit_price),
        quantity: Number(item.quantity),
        currency_id: 'ARS',
      })),
      payer: {
        name: String(payer.fullname.split(' ')[0]),
        surname: String(payer.fullname.split(' ').slice(1).join(' ')),
        email: payer.email,
      },
      back_urls: {
        success: "https://briagopinturas.com/compra-exitosa",
        failure: "https://briagopinturas.com/error-en-pago",
        pending: "https://briagopinturas.com/pago-pendiente",
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
      if (!paymentId) throw new Error('No se encontró el ID del pago.');
      const payment = await mercadopago.payment.get(paymentId);
      
      if (payment.body.status === 'approved') {
        const external_reference = payment.body.external_reference;
        console.log(`Pago aprobado para la orden: ${external_reference}`);
        
        const orderData = pendingOrders.get(external_reference);
        if (orderData) {
          const { items, payer } = orderData;
          const totalAmount = payment.body.transaction_amount.toLocaleString('es-AR');

          const itemsHtml = items.map(item => `
            <tr style="border-bottom: 1px solid #eaeaea;">
              <td style="padding: 10px 5px; vertical-align: top;">${item.title}</td>
              <td style="padding: 10px 5px; text-align: center; vertical-align: top;">${item.quantity}</td>
              <td style="padding: 10px 5px; text-align: right; font-weight: 600; vertical-align: top;">$${Number(item.unit_price).toLocaleString('es-AR')}</td>
            </tr>
          `).join('');
          
          // --- [INICIO DE PLANTILLAS DE CORREO CORTAS Y DIRECTAS] ---
          const sellerEmailHtml = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ccc;">
              <div style="background-color: #333; color: #fff; padding: 12px 15px;">
                <h1 style="margin:0; font-size: 20px;">Nueva Venta: #${external_reference}</h1>
              </div>
              <div style="padding: 15px;">
                <h2 style="font-size: 16px; margin: 0 0 10px 0; border-bottom: 2px solid #eee; padding-bottom: 5px;">Datos para Despacho</h2>
                <p style="margin: 4px 0;"><strong>Cliente:</strong> ${payer.fullname}</p>
                <p style="margin: 4px 0;"><strong>Teléfono:</strong> ${payer.phone}</p>
                <p style="margin: 4px 0;"><strong>Email:</strong> ${payer.email}</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 10px 0;">
                <p style="margin: 4px 0;"><strong>Dirección:</strong> ${payer.address}, ${payer.city} (${payer.postalcode})</p>
                <p style="margin: 4px 0;"><strong>Entre Calles:</strong> ${payer.entreCalles || 'N/A'}</p>
                <div style="background-color: #fffbe6; border: 1px solid #ffe58f; padding: 10px; border-radius: 4px; margin-top: 15px;">
                  <strong>Notas del Cliente:</strong>
                  <p style="margin: 5px 0 0 0;"><em>${payer.descripcion || 'Sin notas.'}</em></p>
                </div>
                <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;">
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <thead>
                    <tr>
                      <th style="padding-bottom: 8px; border-bottom: 2px solid #333; text-align: left;">Producto</th>
                      <th style="padding-bottom: 8px; border-bottom: 2px solid #333; text-align: center;">Cant.</th>
                      <th style="padding-bottom: 8px; border-bottom: 2px solid #333; text-align: right;">Precio</th>
                    </tr>
                  </thead>
                  <tbody>${itemsHtml}</tbody>
                </table>
                <div style="text-align: right; margin-top: 15px; padding-top: 10px; border-top: 2px solid #333;">
                  <strong style="font-size: 18px;">Total: $${totalAmount}</strong>
                </div>
              </div>
            </div>`;
          
          const customerEmailHtml = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: auto; border: 1px solid #eee;">
              <div style="background-color: #fff03b; padding: 20px; text-align: center;">
                <img src="https://briagopinturas.com/assets/LogoHeader-7HScdbpq.png" alt="Briago Pinturas Logo" style="max-width: 130px;">
              </div>
              <div style="padding: 20px 20px 15px 20px;">
                <h1 style="font-size: 22px; margin: 0 0 10px 0;">¡Tu compra está confirmada!</h1>
                <p style="color: #555; margin: 0;"><strong>N° de Pedido:</strong> #${external_reference}</p>
                <p style="color: #555; margin: 0 0 20px 0;"><strong>Total Pagado:</strong> $${totalAmount}</p>
                <div style="border-top: 2px solid #eee; margin-bottom: 20px;"></div>
                <h2 style="font-size: 16px; margin: 0 0 10px 0;">Resumen</h2>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tbody>${itemsHtml}</tbody>
                </table>
                <div style="border-top: 2px solid #eee; margin: 20px 0;"></div>
                <h2 style="font-size: 16px; margin: 0 0 10px 0;">Datos de Envío</h2>
                <p style="margin: 0; color: #555; font-size: 14px;">${payer.fullname}</p>
                <p style="margin: 0; color: #555; font-size: 14px;">${payer.address}, ${payer.city} (${payer.postalcode})</p>
                ${payer.entreCalles ? `<p style="margin: 0; color: #555; font-size: 14px;"><em>(Entre: ${payer.entreCalles})</em></p>` : ''}
              </div>
              <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; border-top: 1px solid #eee;">
                <p style="margin:0;">¿Dudas? Respondé a este email o contactanos a briagopinturas@gmail.com</p>
              </div>
            </div>`;
          // --- [FIN DE PLANTILLAS DE CORREO CORTAS Y DIRECTAS] ---

          try {
            // 1. Enviar email de notificación INTERNO
            await resend.emails.send({
              from: 'Tienda Briago <Administracion@briagopinturas.com>',
              to: ['besadamateo@gmail.com', 'briagopinturas@gmail.com'],
              subject: `Venta Confirmada: #${external_reference}`,
              html: sellerEmailHtml
            });
            console.log('Email de notificación interno enviado con éxito.');

            // 2. Enviar email de confirmación EXTERNO
            await resend.emails.send({
              from: 'Tienda Briago <Administracion@briagopinturas.com>',
              to: [payer.email],
              subject: `¡Confirmamos tu pedido #${external_reference}!`,
              html: customerEmailHtml
            });
            console.log('Email de confirmación al cliente enviado con éxito.');

          } catch (emailError) {
             console.error("Error al enviar uno de los correos:", emailError);
          }
          
          pendingOrders.delete(external_reference);
        }
      }
    }
  } catch (error) {
    console.error('Error al procesar el webhook:', error);
  }
  
  res.status(200).send('OK');
});

// [SIN CAMBIOS] Tu servidor se inicia de la misma forma.
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});