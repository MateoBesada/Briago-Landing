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

// [SIN CAMBIOS] Tu endpoint /create_preference está bien
app.post('/create_preference', async (req, res) => {
  try {
    const { items, payer, external_reference, additional_info } = req.body;
    
    if (!items || !Array.isArray(items) || !items.length) {
      return res.status(400).json({ error: 'La lista de productos es inválida.' });
    }
    if (!payer || typeof payer.email !== 'string') {
      return res.status(400).json({ error: 'La información del comprador es inválida.' });
    }
    
    // Guardamos los items tal como vienen del front (con title, unit_price, quantity)
    pendingOrders.set(external_reference, { items, payer, additional_info });
    
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


// --- [SECCIÓN MODIFICADA] ---
// Reemplaza todo tu app.post('/webhook-mercadopago', ...) por este bloque:
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
          // 'items' aquí tiene: title, unit_price, quantity
          const { items, payer, additional_info } = orderData; 
          const totalAmount = payment.body.transaction_amount.toLocaleString('es-AR');

          // --- [CAMBIO 1 de 2] ---
          // Usamos item.title, item.quantity y item.unit_price
          // Eliminamos la línea de modoVenta
          const itemsHtml = items.map(item => `
            <tr style="border-bottom: 1px solid #eaeaea;">
              <td style="padding: 10px 5px; vertical-align: top;">
                ${item.title} 
              </td>
              <td style="padding: 10px 5px; text-align: center; vertical-align: top;">${item.quantity}</td>
              <td style="padding: 10px 5px; text-align: right; font-weight: 600; vertical-align: top;">$${Number(item.unit_price).toLocaleString('es-AR')}</td>
            </tr>
          `).join('');
          
          // [SIN CAMBIOS] El HTML del vendedor se mantiene igual
          const sellerEmailHtml = `
            <div style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; max-width: 600px; margin: 40px auto; border: 1px solid #eaeaea; border-radius: 12px; overflow: hidden;">
              <div style="background-color: #fff03b; padding: 24px; text-align: center;">
                <img src="https://briagopinturas.com/assets/LogoHeader-7HScdbpq.png" alt="Briago Pinturas Logo" style="max-width: 160px; margin: auto;">
              </div>
              <div style="padding: 32px;">
                <h1 style="font-size: 24px; font-weight: 700; text-align: center; color: #111827; margin: 0 0 10px 0;">
                  ¡Nueva Venta!
                </h1>
                <p style="color: #374151; margin: 0; text-align: center; font-size: 16px;">
                  Orden: <strong>#${external_reference}</strong>
                </p>
                <div style="border-top: 1px solid #eaeaea; margin: 24px 0;"></div>
                <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px;">
                  <h2 style="font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 16px 0;">
                    Datos para el Despacho
                  </h2>
                  <h3 style="font-size: 15px; font-weight: 600; color: #374151; margin: 0 0 4px 0;">Contacto del Cliente</h3>
                  <p style="margin: 0 0 4px 0; color: #374151; font-size: 14px;"><strong>Nombre:</strong> ${payer.fullname}</p>
                  <p style="margin: 0 0 4px 0; color: #374151; font-size: 14px;"><strong>Email:</strong> <a href="mailto:${payer.email}" style="color: #007bff;">${payer.email}</a></p>
                  <p style="margin: 0 0 16px 0; color: #374151; font-size: 14px;"><strong>Teléfono:</strong> ${payer.phone || 'No especificado'}</p>
                  <h3 style="font-size: 15px; font-weight: 600; color: #374151; margin: 0 0 4px 0;">Dirección de Envío</h3>
                  <p style="margin: 0 0 4px 0; color: #374151; font-size: 14px;"><strong>Dirección:</strong> ${payer.address}, ${payer.city}</p>
                  <p style="margin: 0 0 4px 0; color: #374151; font-size: 14px;"><strong>Entre Calles:</strong> ${payer.entreCalles || 'No especificado'}</p>
                  <p style="margin: 0 0 16px 0; color: #374151; font-size: 14px;"><strong>Código Postal:</strong> ${payer.postalcode || 'No especificado'}</p>
                  ${payer.descripcion ? `
                    <div style="background-color: #fffbe6; border-left: 4px solid #facc15; padding: 12px; margin-top: 16px;">
                      <p style="margin: 0; font-size: 14px; font-weight: 600; color: #78350f;">Nota del Cliente:</p>
                      <p style="margin: 4px 0 0 0; font-size: 14px; color: #78350f;"><em>${payer.descripcion}</em></p>
                    </div>
                  ` : ''}
                </div>
                <div style="border-top: 1px solid #eaeaea; margin: 24px 0;"></div>
                <h2 style="font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 16px 0;">
                  Items del Pedido
                </h2>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <thead>
                    <tr>
                      <th style="padding: 10px; border-bottom: 2px solid #374151; text-align: left; color: #374151;">Producto</th>
                      <th style="padding: 10px; border-bottom: 2px solid #374151; text-align: center; color: #374151;">Cant.</th>
                      <th style="padding: 10px; border-bottom: 2px solid #374151; text-align: right; color: #374151;">Precio</th>
                    </tr>
                  </thead>
                  <tbody>${itemsHtml}</tbody>
                </table>
                <div style="text-align: right; margin-top: 24px; padding-top: 16px; border-top: 2px solid #374151;">
                  <strong style="font-size: 22px; color: #111827;">Total Pagado: $${totalAmount}</strong>
                </div>
              </div>
              <div style="padding: 16px; text-align: center; font-size: 12px; color: #6c757d;">
                Email de notificación de Briago Pinturas.
              </div>
            </div>
          `;
          
          // --- [CAMBIO 2 de 2] ---
          // Usamos item.title, item.quantity y item.unit_price
          // Eliminamos "Modo" y dejamos solo la cantidad "x"
          const customerItemsHtml = items.map(item => `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px 5px;">
                ${item.title}
                <span style="font-size: 12px; color: #6b7280; display: block;">
                  x${item.quantity}
                </span>
              </td>
              <td style="padding: 10px 5px; text-align: right; font-weight: 600;">$${(Number(item.unit_price) * item.quantity).toLocaleString('es-AR')}</td>
            </tr>
          `).join('');

          // [SIN CAMBIOS] El HTML del cliente se mantiene igual
          const customerEmailHtml = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: auto; border: 1px solid #eee;">
              <div style="background-color: #fff03b; padding: 20px; text-align: center;">
                <img src="https://briagopinturas.com/assets/LogoHeader-7HScdbpq.png" alt="Briago Pinturas Logo" style="max-width: 130px;">
              </div>
              <div style="padding: 20px 20px 15px 20px;">
                <h1 style="font-size: 22px; margin: 0 0 10px 0;">¡Tu compra está confirmada, ${payer.name}!</h1>
                <p style="color: #555; margin: 0;"><strong>N° de Pedido:</strong> #${external_reference}</p>
                <p style="color: #555; margin: 0 0 20px 0;"><strong>Total Pagado:</strong> $${totalAmount}</p>
                
                ${ (new Date().getUTCHours() - 3 + 24) % 24 < 8 || (new Date().getUTCHours() - 3 + 24) % 24 >= 18 ? `
                  <p style="background-color: #fffbe6; border: 1px solid #ffe58f; padding: 12px; border-radius: 8px; font-size: 13px; color: #78350f; margin-top: 20px;">
                    <strong>Nota:</strong> Recibimos tu pedido fuera de nuestro horario comercial. 
                    <strong>Revisaremos tu compra el día de mañana.</strong> ¡Gracias por tu paciencia!
                  </p>
                ` : '' }
                
                <div style="border-top: 2px solid #eee; margin-bottom: 20px; margin-top: 20px;"></div>
                <h2 style="font-size: 16px; margin: 0 0 10px 0;">Resumen</h2>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tbody>${customerItemsHtml}</tbody>
                </table>
              </div>
              <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; border-top: 1px solid #eee;">
                <p style="margin:0;">¿Dudas? Contactanos a briagopinturas@gmail.com</p>
              </div>
            </div>`;

          // [SIN CAMBIOS] La lógica de envío de emails se mantiene
          try {
            await resend.emails.send({
              from: 'Tienda Briago <Administracion@briagopinturas.com>',
              to: ['besadamateo@gmail.com', 'briagopinturas@gmail.com'],
              subject: `Venta Confirmada: #${external_reference}`,
              html: sellerEmailHtml
            });
            console.log('Email de notificación interno enviado con éxito.');

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
// --- [FIN DE LA SECCIÓN MODIFICADA] ---


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});