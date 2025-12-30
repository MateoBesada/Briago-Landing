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

// ALMACÉN TEMPORAL DE ÓRDENES
const pendingOrders = new Map();

// ---------------------------------------------------------
// 1. TU BASE DE DATOS DE PRECIOS
// ---------------------------------------------------------
// Pon aquí el PRECIO FINAL que quieres cobrar en la tarjeta.
// El servidor cobrará exactamente este número.
const PRODUCTOS_DB = [
    { id: '10', nombre: "Latex Interior Z10 20L", precioFinal: 253468, maxCuotas: 3 },
    { id: '20', nombre: "Latex Interior Z10 10L", precioFinal: 138112, maxCuotas: 3 },
    { id: '30', nombre: "Latex Interior Z10 4L", precioFinal: 47297, maxCuotas: 3 },
    { id: '40', nombre: "Latex Interior Quantum 20L", precioFinal: 183651, maxCuotas: 3 },
    { id: '50', nombre: "Latex Interior Quantum 4L", precioFinal: 61976, maxCuotas: 3 },
    { id: '60', nombre: "Latex Int/Ext Quantum 20L", precioFinal: 203607, maxCuotas: 3 },
    { id: '70', nombre: "Latex Int/Ext Quantum 4L", precioFinal: 63798, maxCuotas: 3 },
    { id: '80', nombre: "Fijador Quantum 20L", precioFinal: 115294, maxCuotas: 3 },
    { id: '90', nombre: "Fijador Quantum 4L", precioFinal: 22235, maxCuotas: 3 },
    // Agrega el resto de tus productos aquí...
    { id: 'kovax-ejemplo', nombre: "Lija Kovax", precioFinal: 7500, maxCuotas: 6 }
];


// ---------------------------------------------------------
// ENDPOINT 1: COTIZADOR
// ---------------------------------------------------------
app.post('/api/cotizar', async (req, res) => {
    try {
        const { codigo_postal, provincia } = req.body;
        const apiKey = process.env.ENVIOPACK_API_KEY;
        const secretKey = process.env.ENVIOPACK_SECRET_KEY;

        if (!apiKey || !secretKey) return res.status(500).json({ error: "Faltan claves de EnvíoPack" });

        const authResponse = await fetch('https://api.enviopack.com/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ 'api-key': apiKey, 'secret-key': secretKey })
        });

        if (!authResponse.ok) throw new Error(`Auth fallida EnvíoPack`);
        const { token } = await authResponse.json();

        const params = new URLSearchParams({
            access_token: token,
            provincia: provincia,
            codigo_postal: codigo_postal,
            peso: '22.0',
            paquetes: '30x30x40'
        });

        const cotizacionResponse = await fetch(`https://api.enviopack.com/cotizar/costo?${params}`);
        if (!cotizacionResponse.ok) return res.json([]);

        const resultados = await cotizacionResponse.json();
        res.json(resultados);
    } catch (error) {
        console.error("❌ Error al cotizar:", error.message);
        res.status(500).json({ error: "Error al cotizar envío" });
    }
});


// ---------------------------------------------------------
// ENDPOINT 2: CREAR PREFERENCIA (CHECKOUT PRO)
// ---------------------------------------------------------
app.post('/create_preference', async (req, res) => {
    try {
        const { items, payer, external_reference } = req.body;
        console.log(`🛒 Nueva solicitud de pago: ${external_reference}`);

        if (!items || !items.length) return res.status(400).json({ error: 'Carrito vacío' });

        let maxCuotasPermitidasCarrito = 12;

        const itemsProcesados = items.map(itemFrontend => {
            if (itemFrontend.id === 'envio') {
                return {
                    title: itemFrontend.title,
                    unit_price: Number(itemFrontend.unit_price),
                    quantity: 1,
                    currency_id: 'ARS'
                };
            }

            // Buscamos el precio en la DB del servidor
            const productoDB = PRODUCTOS_DB.find(p => p.id === String(itemFrontend.id));

            // Usamos el precio de la DB (seguro) o el del front (fallback)
            let precioFinal = productoDB ? productoDB.precioFinal : Number(itemFrontend.unit_price);
            let maxCuotasProd = productoDB ? productoDB.maxCuotas : 3;

            // Limitamos las cuotas si el producto lo requiere
            if (maxCuotasProd < maxCuotasPermitidasCarrito) {
                maxCuotasPermitidasCarrito = maxCuotasProd;
            }

            return {
                title: itemFrontend.title,
                unit_price: Number(precioFinal),
                quantity: Number(itemFrontend.quantity),
                currency_id: 'ARS',
                picture_url: productoDB ? productoDB.imagen : ''
            };
        });

        // Guardamos en memoria para el webhook
        pendingOrders.set(external_reference, { items: itemsProcesados, payer });

        const preference = {
            items: itemsProcesados,
            payer: {
                name: String(payer.name),
                surname: String(payer.surname),
                email: payer.email,
                phone: { area_code: "54", number: Number(payer.phone?.number) },
                address: { zip_code: String(payer.address?.zip_code), street_name: String(payer.address?.street_name) }
            },
            back_urls: {
                success: "https://briago-pinturas.com/compra-exitosa",
                failure: "https://briago-pinturas.com/error-en-pago",
                pending: "https://briago-pinturas.com/pago-pendiente",
            },
            auto_return: "approved",
            external_reference: external_reference,
            notification_url: "https://checkout-server-gehy.onrender.com/webhook-mercadopago",
            payment_methods: {
                installments: maxCuotasPermitidasCarrito
            }
        };

        const result = await mercadopago.preferences.create(preference);

        res.json({
            id: result.body.id,
            init_point: result.body.init_point
        });

    } catch (error) {
        console.error('❌ Error create_preference:', error);
        res.status(500).json({ error: 'Error al generar link de pago' });
    }
});


// ---------------------------------------------------------
// ENDPOINT 3: WEBHOOK (CORREOS OFICIALES)
// ---------------------------------------------------------
app.post('/webhook-mercadopago', async (req, res) => {
    res.status(200).send('OK'); // Respondemos OK rápido a MP

    const type = req.body.type || req.query.type;
    const dataId = req.body.data?.id || req.body.id || req.query['data.id'];

    if (type === 'payment' && dataId) {
        console.log(`🔔 Webhook recibido. ID Pago: ${dataId}`);

        try {
            const payment = await mercadopago.payment.get(dataId);
            const status = payment.body.status;
            const extRef = payment.body.external_reference;

            if (status === 'approved') {
                const orderData = pendingOrders.get(extRef);

                if (!orderData) {
                    console.error(`⚠️ No encontré datos en memoria para la orden ${extRef}. (Servidor reiniciado?)`);
                    return;
                }

                console.log(`✅ Pago Aprobado. Enviando emails a ${orderData.payer.email}...`);

                // HTML del correo
                const itemsHtml = orderData.items.map(item =>
                    `<li style="margin-bottom: 5px;">
                        <strong>${item.title}</strong> x${item.quantity} 
                        - $${Number(item.unit_price).toLocaleString('es-AR')}
                    </li>`
                ).join('');

                const emailHtml = `
                    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                        <div style="background: #000; color: #fff03b; padding: 20px; text-align: center;">
                            <h1>¡Compra Exitosa!</h1>
                        </div>
                        <div style="padding: 20px;">
                            <p>Hola <strong>${orderData.payer.name}</strong>,</p>
                            <p>Hemos recibido tu pago correctamente. Aquí está el resumen de tu pedido:</p>
                            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                            <ul style="list-style: none; padding: 0;">${itemsHtml}</ul>
                            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                            <h2 style="text-align: right;">Total: $${payment.body.transaction_amount.toLocaleString('es-AR')}</h2>
                            <p style="font-size: 12px; color: #666; margin-top: 30px;">
                                Referencia: #${extRef} <br>
                                Briago Pinturas
                            </p>
                        </div>
                    </div>
                `;

                // --- ENVÍO DE EMAIL CON DOMINIO PROPIO ---
                const emailResult = await resend.emails.send({
                    from: 'Briago Pinturas <ventas@briagopinturas.com>', // <--- ¡AQUÍ ESTÁ EL CAMBIO!
                    to: [orderData.payer.email, 'besadamateo@gmail.com'], // Le llega al cliente y a ti
                    subject: `Confirmación de Compra #${extRef}`,
                    html: emailHtml
                });

                if (emailResult.error) {
                    console.error("❌ Error enviando email:", emailResult.error);
                } else {
                    console.log("📧 Emails enviados con éxito. ID:", emailResult.data?.id);
                }

                pendingOrders.delete(extRef);
            }
        } catch (error) {
            console.error('❌ Error procesando webhook:', error);
        }
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`✅ Servidor corriendo en puerto ${port}`);
});