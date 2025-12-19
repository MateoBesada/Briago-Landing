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

// ---------------------------------------------------------
// CONFIGURACIÓN
// ---------------------------------------------------------
const resend = new Resend(process.env.RESEND_API_KEY);

mercadopago.configure({
    access_token: process.env.MP_ACCESS_TOKEN,
});

const pendingOrders = new Map();

// Constantes para EnvíoPack (Valores por defecto para pintura)
const PESO_DEFAULT = 22.0;
const MEDIDAS_DEFAULT = '30x30x40';

// ---------------------------------------------------------
// ENDPOINT 1: COTIZADOR DE ENVÍOPACK (NUEVO)
// ---------------------------------------------------------
app.post('/api/cotizar', async (req, res) => {
    try {
        const { codigo_postal, provincia } = req.body;
        const apiKey = process.env.ENVIOPACK_API_KEY;
        const secretKey = process.env.ENVIOPACK_SECRET_KEY;

        if (!apiKey || !secretKey) {
            console.error("❌ Faltan las claves de EnvíoPack en Render (Environment Variables)");
            return res.status(500).json({ error: "Error de configuración del servidor." });
        }

        console.log(`📡 Cotizando envío para CP: ${codigo_postal} (${provincia})`);

        // 1. AUTENTICACIÓN CON ENVIOPACK
        const authResponse = await fetch('https://api.enviopack.com/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ 'api-key': apiKey, 'secret-key': secretKey })
        });

        if (!authResponse.ok) {
            const errorText = await authResponse.text();
            throw new Error(`Fallo la autenticación con EnvíoPack: ${errorText}`);
        }

        const authData = await authResponse.json();
        const token = authData.token;

        // 2. SOLICITAR COTIZACIÓN
        const params = new URLSearchParams({
            access_token: token,
            provincia: provincia,
            codigo_postal: codigo_postal,
            peso: PESO_DEFAULT,
            paquetes: MEDIDAS_DEFAULT
        });

        // Usamos la ruta correcta /cotizar/costo
        const cotizacionResponse = await fetch(`https://api.enviopack.com/cotizar/costo?${params}`);

        if (!cotizacionResponse.ok) {
            // Si falla (ej: CP inválido), devolvemos array vacío para no romper el front
            console.error("Error en API Cotización:", await cotizacionResponse.text());
            return res.json([]);
        }

        const resultados = await cotizacionResponse.json();

        // 3. RESPONDER AL FRONTEND
        res.json(resultados);

    } catch (error) {
        console.error("❌ Error al cotizar:", error.message);
        res.status(500).json({ error: "Error al cotizar envío" });
    }
});


// ---------------------------------------------------------
// ENDPOINT 2: CREAR PREFERENCIA MERCADO PAGO
// ---------------------------------------------------------
app.post('/create_preference', async (req, res) => {
    try {
        const { items, payer, external_reference, additional_info } = req.body;

        if (!items || !Array.isArray(items) || !items.length) {
            return res.status(400).json({ error: 'La lista de productos es inválida.' });
        }
        if (!payer || typeof payer.email !== 'string') {
            return res.status(400).json({ error: 'La información del comprador es inválida.' });
        }

        // Guardamos los items temporalmente
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


// ---------------------------------------------------------
// ENDPOINT 3: WEBHOOK (NOTIFICACIONES Y EMAILS)
// ---------------------------------------------------------
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
                    const { items, payer, additional_info } = orderData;
                    const totalAmount = payment.body.transaction_amount.toLocaleString('es-AR');

                    // --- GENERACIÓN DE EMAIL (HTML) ---
                    const itemsHtml = items.map(item => `
            <tr style="border-bottom: 1px solid #eaeaea;">
              <td style="padding: 10px 5px; vertical-align: top;">${item.title}</td>
              <td style="padding: 10px 5px; text-align: center; vertical-align: top;">${item.quantity}</td>
              <td style="padding: 10px 5px; text-align: right; font-weight: 600; vertical-align: top;">$${Number(item.unit_price).toLocaleString('es-AR')}</td>
            </tr>`).join('');

                    const customerItemsHtml = items.map(item => `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px 5px;">
                ${item.title}
                <span style="font-size: 12px; color: #6b7280; display: block;">x${item.quantity}</span>
              </td>
              <td style="padding: 10px 5px; text-align: right; font-weight: 600;">$${(Number(item.unit_price) * item.quantity).toLocaleString('es-AR')}</td>
            </tr>`).join('');

                    // --- EMAIL VENDEDOR ---
                    const sellerEmailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 40px auto; border: 1px solid #eaeaea; border-radius: 12px; overflow: hidden;">
              <div style="background-color: #fff03b; padding: 24px; text-align: center;">
                <h1 style="margin:0;">¡Nueva Venta! #${external_reference}</h1>
              </div>
              <div style="padding: 32px;">
                <h3>Datos del Cliente:</h3>
                <p><strong>Nombre:</strong> ${payer.fullname}</p>
                <p><strong>Email:</strong> ${payer.email}</p>
                <p><strong>Dirección:</strong> ${payer.address}, ${payer.city} (CP: ${payer.postalcode})</p>
                <p><strong>Nota:</strong> ${payer.descripcion || '-'}</p>
                <hr>
                <h3>Productos:</h3>
                <table style="width: 100%;">${itemsHtml}</table>
                <h2 style="text-align:right;">Total: $${totalAmount}</h2>
              </div>
            </div>`;

                    // --- EMAIL CLIENTE ---
                    const customerEmailHtml = `
            <div style="font-family: sans-serif; max-width: 500px; margin: 40px auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
              <div style="background-color: #fff03b; padding: 20px; text-align: center;">
                <h1 style="margin:0;">¡Gracias por tu compra, ${payer.fullname}!</h1>
              </div>
              <div style="padding: 24px;">
                <p>Tu pedido <strong>#${external_reference}</strong> está confirmado.</p>
                <table style="width: 100%;">${customerItemsHtml}</table>
                <h3 style="text-align:right;">Total Pagado: $${totalAmount}</h3>
              </div>
            </div>`;

                    // --- ENVIO DE CORREOS ---
                    try {
                        await resend.emails.send({
                            from: 'Tienda Briago <Administracion@briagopinturas.com>',
                            to: ['besadamateo@gmail.com', 'briagopinturas@gmail.com'],
                            subject: `Venta Confirmada: #${external_reference}`,
                            html: sellerEmailHtml
                        });

                        await resend.emails.send({
                            from: 'Tienda Briago <Administracion@briagopinturas.com>',
                            to: [payer.email],
                            subject: `¡Confirmamos tu pedido #${external_reference}!`,
                            html: customerEmailHtml
                        });
                        console.log('Emails enviados con éxito.');

                    } catch (emailError) {
                        console.error("Error al enviar correos:", emailError);
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

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`✅ Servidor corriendo en puerto ${port}`);
});