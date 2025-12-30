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

// URL de tu logo para los emails (Cámbiala por la real si la tienes)
const LOGO_URL = "https://briagopinturas.com/assets/LogoHeader-7HScdbpq.png";

// ALMACÉN TEMPORAL DE ÓRDENES
const pendingOrders = new Map();

// ---------------------------------------------------------
// 1. TU BASE DE DATOS DE PRECIOS
// ---------------------------------------------------------
// IMPORTANTE: Estos son los precios FINALES que se cobrarán en la tarjeta.
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
// ENDPOINT 2: CREAR PREFERENCIA
// ---------------------------------------------------------
app.post('/create_preference', async (req, res) => {
    try {
        const { items, payer, external_reference } = req.body;
        console.log(`🛒 Nueva solicitud: ${external_reference}`);

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

            const productoDB = PRODUCTOS_DB.find(p => p.id === String(itemFrontend.id));
            let precioFinal = productoDB ? productoDB.precioFinal : Number(itemFrontend.unit_price);
            let maxCuotasProd = productoDB ? productoDB.maxCuotas : 3;

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

        // Guardamos TODA la info del pagador (DNI, Teléfono, etc)
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
// ENDPOINT 3: WEBHOOK (EL CEREBRO DE LOS EMAILS)
// ---------------------------------------------------------
app.post('/webhook-mercadopago', async (req, res) => {
    res.status(200).send('OK');

    const type = req.body.type || req.query.type;
    const dataId = req.body.data?.id || req.body.id || req.query['data.id'];

    if (type === 'payment' && dataId) {
        try {
            const payment = await mercadopago.payment.get(dataId);
            const status = payment.body.status;
            const extRef = payment.body.external_reference;

            if (status === 'approved') {
                const orderData = pendingOrders.get(extRef);

                if (!orderData) return;

                const { items, payer } = orderData;
                const totalFormatted = payment.body.transaction_amount.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });

                // -----------------------------------------------------
                // 1. DISEÑO EMAIL CLIENTE (GRACIAS POR COMPRAR)
                // -----------------------------------------------------
                const clienteItemsHtml = items.map(item => `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; color: #333;">${item.title}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center; color: #333;">${item.quantity}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold; color: #333;">$${Number(item.unit_price).toLocaleString('es-AR')}</td>
                    </tr>
                `).join('');

                const htmlCliente = `
                <!DOCTYPE html>
                <html>
                <body style="margin:0; padding:0; background-color:#f4f4f4; font-family: Arial, sans-serif;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                        <div style="background-color: #000000; padding: 20px; text-align: center;">
                            <h1 style="color: #fff03b; margin: 0; font-size: 24px;">BRIAGO PINTURAS</h1>
                        </div>
                        
                        <div style="padding: 30px;">
                            <h2 style="color: #000; margin-top: 0;">¡Hola ${payer.name}!</h2>
                            <p style="color: #666; line-height: 1.5;">Tu pago ha sido aprobado correctamente. Estamos preparando tu pedido.</p>
                            
                            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 0; font-size: 14px; color: #555;"><strong>N° de Orden:</strong> #${extRef}</p>
                            </div>

                            <table style="width: 100%; border-collapse: collapse;">
                                <thead>
                                    <tr>
                                        <th style="text-align: left; color: #999; font-size: 12px; border-bottom: 2px solid #eee; padding-bottom: 10px;">PRODUCTO</th>
                                        <th style="text-align: center; color: #999; font-size: 12px; border-bottom: 2px solid #eee; padding-bottom: 10px;">CANT.</th>
                                        <th style="text-align: right; color: #999; font-size: 12px; border-bottom: 2px solid #eee; padding-bottom: 10px;">PRECIO</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${clienteItemsHtml}
                                </tbody>
                            </table>

                            <div style="margin-top: 20px; text-align: right;">
                                <p style="font-size: 18px; margin: 0;">Total Pagado:</p>
                                <p style="font-size: 28px; font-weight: bold; color: #000; margin: 5px 0;">${totalFormatted}</p>
                            </div>

                            <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                            
                            <p style="text-align: center; color: #999; font-size: 12px;">
                                Gracias por confiar en nosotros.<br>
                                Briago Pinturas - Especialistas en Automotor y Obra
                            </p>
                        </div>
                    </div>
                </body>
                </html>
                `;

                // -----------------------------------------------------
                // 2. DISEÑO EMAIL VENDEDOR (DATOS DUROS PARA TI)
                // -----------------------------------------------------
                const vendedorItemsHtml = items.map(item => `
                    <li><strong>${item.quantity}x</strong> ${item.title}</li>
                `).join('');

                const htmlVendedor = `
                <!DOCTYPE html>
                <html>
                <body style="font-family: Arial, sans-serif; background-color: #eee; padding: 20px;">
                    <div style="max-width: 500px; margin: 0 auto; background-color: #fff; padding: 20px; border-left: 5px solid #fff03b;">
                        <h2 style="margin-top: 0; color: #000;">🔔 NUEVA VENTA CONFIRMADA</h2>
                        <p style="font-size: 14px; color: #666;">Referencia: <strong>#${extRef}</strong></p>
                        
                        <div style="background-color: #f0f0f0; padding: 15px; margin: 15px 0;">
                            <h3 style="margin: 0 0 10px 0; font-size: 16px;">👤 Datos del Cliente</h3>
                            <p style="margin: 2px 0;"><strong>Nombre:</strong> ${payer.name} ${payer.surname}</p>
                            <p style="margin: 2px 0;"><strong>DNI:</strong> ${payer.identification?.number || '-'}</p>
                            <p style="margin: 2px 0;"><strong>Teléfono:</strong> ${payer.phone?.number || '-'}</p>
                            <p style="margin: 2px 0;"><strong>Email:</strong> ${payer.email}</p>
                        </div>

                        <div style="background-color: #f0f0f0; padding: 15px; margin: 15px 0;">
                            <h3 style="margin: 0 0 10px 0; font-size: 16px;">🚚 Envío / Entrega</h3>
                            <p style="margin: 2px 0;"><strong>Dirección:</strong> ${payer.address?.street_name || '-'}</p>
                            <p style="margin: 2px 0;"><strong>CP / Ciudad:</strong> ${payer.address?.zip_code}</p>
                        </div>

                        <h3>📦 Productos:</h3>
                        <ul>${vendedorItemsHtml}</ul>
                        
                        <h2 style="text-align: right;">Total: ${totalFormatted}</h2>
                    </div>
                </body>
                </html>
                `;

                // -----------------------------------------------------
                // 3. ENVIAR LOS CORREOS (POR SEPARADO)
                // -----------------------------------------------------

                // Email al Cliente
                await resend.emails.send({
                    from: 'Briago Pinturas <ventas@briagopinturas.com>',
                    to: [payer.email],
                    subject: `Confirmación de Compra #${extRef}`,
                    html: htmlCliente
                });

                // Email al Vendedor (A ti)
                await resend.emails.send({
                    from: 'Sistema Briago <ventas@briagopinturas.com>',
                    to: ['besadamateo@gmail.com'],
                    subject: `💰 Nueva Venta: $${payment.body.transaction_amount}`,
                    html: htmlVendedor
                });

                console.log(`✅ Emails enviados para orden ${extRef}`);
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