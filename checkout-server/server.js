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

          const itemsHtml = items.map(item => `
            <tr style="border-bottom: 1px solid #eaeaea;">
              <td style="padding: 12px 0; vertical-align: top;">${item.title}</td>
              <td style="padding: 12px 0; text-align: center; vertical-align: top;">${item.quantity}</td>
              <td style="padding: 12px 0; text-align: right; font-weight: 600; vertical-align: top;">$${Number(item.unit_price).toLocaleString('es-AR')}</td>
            </tr>
          `).join('');
          
          try {
            // --- [CAMBIO APLICADO AQUÍ] ---
            // 1. Enviar email de notificación INTERNO (para vos) con formato profesional
            await resend.emails.send({
              from: 'Tienda Briago <Administracion@briagopinturas.com>',
              to: ['besadamateo@gmail.com', 'briagopinturas@gmail.com'],
              subject: `¡Nueva Venta! - Orden #${external_reference}`,
              html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 20px auto; border: 1px solid #ddd; border-radius: 12px; overflow: hidden;">
                <div style="background-color: #333; padding: 20px; text-align: center;">
                  <img src="https://briagopinturas.com/assets/LogoHeader-7HScdbpq.png" alt="Briago Pinturas Logo" style="max-width: 150px; margin: auto;">
                </div>
                <div style="padding: 24px;">
                  <h1 style="font-size: 24px; font-weight: 700; color: #333;">¡Nueva Venta Recibida!</h1>
                  <p style="color: #555;">Orden de Compra: <strong>#${external_reference}</strong></p>
                  
                  <div style="border-top: 1px solid #eaeaea; margin: 24px 0;"></div>
                  
                  <h2 style="font-size: 18px; font-weight: 600; color: #333; margin-bottom: 12px;">Datos del Cliente</h2>
                  <div style="background-color: #f8f9fa; padding: 16px; border-radius: 8px;">
                    <p style="margin: 4px 0;"><strong>Nombre:</strong> ${payer.fullname}</p>
                    <p style="margin: 4px 0;"><strong>Email:</strong> <a href="mailto:${payer.email}" style="color: #007bff; text-decoration: none;">${payer.email}</a></p>
                    <p style="margin: 4px 0;"><strong>Teléfono:</strong> ${payer.phone}</p>
                  </div>

                  <h2 style="font-size: 18px; font-weight: 600; color: #333; margin-top: 24px; margin-bottom: 12px;">Datos de Envío</h2>
                  <div style="background-color: #f8f9fa; padding: 16px; border-radius: 8px;">
                    <p style="margin: 4px 0;"><strong>Dirección:</strong> ${payer.address}</p>
                    <p style="margin: 4px 0;"><strong>Ciudad:</strong> ${payer.city} (${payer.postalcode})</p>
                    <p style="margin: 4px 0;"><strong>Entre Calles:</strong> ${payer.entreCalles || 'No especificado'}</p>
                    <p style="margin: 4px 0;"><strong>Descripción Adicional:</strong></p>
                    <p style="margin: 4px 0; padding-left: 10px; border-left: 2px solid #ddd; color: #555;"><em>${payer.descripcion || 'Ninguna'}</em></p>
                  </div>

                  <div style="border-top: 1px solid #eaeaea; margin: 24px 0;"></div>
                  
                  <h2 style="font-size: 18px; font-weight: 600; color: #333;">Detalle del Pedido</h2>
                  <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
                    <thead>
                      <tr>
                        <th style="padding-bottom: 12px; border-bottom: 2px solid #333; text-align: left;">Producto</th>
                        <th style="padding-bottom: 12px; border-bottom: 2px solid #333; text-align: center;">Cant.</th>
                        <th style="padding-bottom: 12px; border-bottom: 2px solid #333; text-align: right;">Precio</th>
                      </tr>
                    </thead>
                    <tbody>${itemsHtml}</tbody>
                  </table>
                  <div style="text-align: right; margin-top: 24px;">
                    <strong style="font-size: 20px;">Total Cobrado: $${payment.body.transaction_amount.toLocaleString('es-AR')}</strong>
                  </div>
                </div>
                <div style="background-color: #f8f9fa; padding: 16px; text-align: center; font-size: 12px; color: #6c757d;">
                  Briago Pinturas &copy; ${new Date().getFullYear()}
                </div>
              </div>
            `
            });
            console.log('Email de notificación interno enviado con éxito.');

            // 2. Enviar email de confirmación EXTERNO (para el cliente)
            await resend.emails.send({
              from: 'Tienda Briago <Administracion@briagopinturas.com>',
              to: [payer.email],
              subject: `Confirmación de tu pedido en Briago Pinturas #${external_reference}`,
              html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 20px auto; border: 1px solid #ddd; border-radius: 12px; overflow: hidden;">
                <div style="background-color: #fff03b; padding: 24px; text-align: center;">
                  <img src="https://briagopinturas.com/assets/LogoHeader-7HScdbpq.png" alt="Briago Pinturas Logo" style="max-width: 150px; margin: auto;">
                </div>
                <div style="padding: 24px;">
                  <h1 style="font-size: 24px; font-weight: 700;">¡Gracias por tu compra, ${payer.fullname.split(' ')[0]}!</h1>
                  <p style="color: #555;">Tu pedido <strong>#${external_reference}</strong> ha sido confirmado y ya lo estamos preparando.</p>
                  <div style="border-top: 1px solid #eaeaea; margin: 24px 0;"></div>
                  <h2 style="font-size: 18px; font-weight: 600; color: #333;">Resumen de tu compra</h2>
                  <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
                    <thead>
                      <tr>
                        <th style="padding-bottom: 12px; border-bottom: 2px solid #333; text-align: left;">Producto</th>
                        <th style="padding-bottom: 12px; border-bottom: 2px solid #333; text-align: center;">Cant.</th>
                        <th style="padding-bottom: 12px; border-bottom: 2px solid #333; text-align: right;">Precio</th>
                      </tr>
                    </thead>
                    <tbody>${itemsHtml}</tbody>
                  </table>
                  <div style="text-align: right; margin-top: 24px;">
                    <strong style="font-size: 20px;">Total pagado: $${payment.body.transaction_amount.toLocaleString('es-AR')}</strong>
                  </div>
                  <div style="border-top: 1px solid #eaeaea; margin: 24px 0;"></div>
                  <h2 style="font-size: 18px; font-weight: 600; color: #333;">Enviado a:</h2>
                  <p style="margin: 4px 0;">${payer.fullname}</p>
                  <p style="margin: 4px 0;">${payer.address}, ${payer.city} (${payer.postalcode})</p>
                  ${payer.entreCalles ? `<p style="margin: 4px 0; color: #555;">(Entre ${payer.entreCalles})</p>` : ''}
                  <div style="margin-top: 24px; background-color: #f8f9fa; padding: 16px; border-radius: 8px; text-align: center;">
                    <p style="margin: 0; font-size: 14px; color: #555;">Si tenés alguna pregunta, respondé a este correo.</p>
                  </div>
                </div>
                <div style="background-color: #f8f9fa; padding: 16px; text-align: center; font-size: 12px; color: #6c757d;">
                  Briago Pinturas &copy; ${new Date().getFullYear()}
                </div>
              </div>
              `
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