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

const pendingOrders = new Map();

const LOGO_URL = 'https://briagopinturas.com/assets/LogoHeader-7HScdbpq.png';

// ---------------------------------------------------------
// CONFIGURACIÓN
// ---------------------------------------------------------
const resend = new Resend(process.env.RESEND_API_KEY);

mercadopago.configure({
    access_token: process.env.MP_ACCESS_TOKEN,
});

// [PUNTO DE MONTAJE PARA EL NUEVO COTIZADOR]
app.post('/api/cotizar', async (req, res) => {
    try {
        console.log("--- SOLICITUD DE COTIZACIÓN RECIBIDA ---");
        const { codigo_postal, provincia } = req.body;
        console.log("Datos:", { codigo_postal, provincia });

        const apiKey = process.env.ENVIOPACK_API_KEY;
        const secretKey = process.env.ENVIOPACK_SECRET_KEY;

        if (!apiKey || !secretKey) {
            console.error("❌ Faltan credenciales de EnvioPack");
            return res.status(500).json({ error: "Configuración de servidor incompleta" });
        }

        // 1. AUTH
        console.log("1. Autenticando con EnvioPack...");
        const authRes = await fetch('https://api.enviopack.com/auth', {
            method: 'POST',
            body: new URLSearchParams({ 'api-key': apiKey, 'secret-key': secretKey })
        });

        if (!authRes.ok) {
            const err = await authRes.text();
            console.error("❌ Error Auth:", err);
            return res.status(401).json({ error: "Error de autenticación con proveedor de envíos" });
        }

        const authData = await authRes.json();
        const token = authData.token;
        console.log("✅ Auth exitosa. Token obtenido.");

        // 2. COTIZAR
        // Hardcodeamos peso y medidas para simplificar, como se pidió
        const peso = 22.0;
        const medidas = '30x30x40';

        const params = new URLSearchParams({
            access_token: token,
            provincia: provincia || 'Buenos Aires',
            codigo_postal: codigo_postal,
            peso: peso,
            paquetes: medidas
        });

        console.log("2. Consultando API de cotización...");
        const cotizarRes = await fetch(`https://api.enviopack.com/cotizar/costo?${params}`);

        if (!cotizarRes.ok) {
            const err = await cotizarRes.text();
            console.error("❌ Error Cotización:", err);
            // Devolvemos array vacío pero sin error 500 para que el front diga "No hay opciones"
            return res.json([]);
        }

        const data = await cotizarRes.json();
        console.log(`✅ Cotización exitosa. Opciones: ${Array.isArray(data) ? data.length : 0}`);

        res.json(data);

    } catch (e) {
        console.error("❌ EXCEPCIÓN EN SERVER:", e);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});



// ---------------------------------------------------------
// ENDPOINT 2: CREAR PREFERENCIA (PRECIO REAL - SIN INFLACIÓN)
// ---------------------------------------------------------
app.post('/create_preference', async (req, res) => {
    try {
        const { items, payer, external_reference } = req.body;
        console.log(`🛒 Nueva preferencia de pago: ${external_reference}`);

        if (!items || !items.length) return res.status(400).json({ error: 'Carrito vacío' });

        // Procesamos los items con el precio EXACTO que manda la web
        const itemsProcesados = items.map(itemFrontend => ({
            title: itemFrontend.title,
            unit_price: Number(itemFrontend.unit_price), // Precio original
            quantity: Number(itemFrontend.quantity),
            currency_id: 'ARS',
            picture_url: ''
        }));

        // Guardamos en memoria para el email posterior
        pendingOrders.set(external_reference, { items: itemsProcesados, payer });

        // URL Base para redirecciones (Local vs Prod)
        const BASE_URL = process.env.CLIENT_URL || "https://briagopinturas.com";

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
                success: `${BASE_URL}/compra-exitosa`,
                failure: `${BASE_URL}/error-en-pago`,
                pending: `${BASE_URL}/pago-pendiente`,
            },
            auto_return: "approved",
            external_reference: external_reference,
            notification_url: "https://checkout-server-gehy.onrender.com/webhook-mercadopago",
            // Sin 'payment_methods.installments' para dejar las cuotas libres
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
// ENDPOINT 3: WEBHOOK (EMAILS FINAL)
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

                if (!orderData) {
                    console.error(`⚠️ No se encontraron datos en memoria para ${extRef}`);
                    return;
                }

                const { items, payer } = orderData;
                const totalFormatted = payment.body.transaction_amount.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });

                // Lógica visual para Envío vs Retiro
                let infoEnvioHtml = '';
                const tieneDireccion = payer.address?.street_name && payer.address.street_name !== 'null';

                if (tieneDireccion) {
                    infoEnvioHtml = `
                        <div style="background-color: #f9f9f9; padding: 10px; border-radius: 4px;">
                            <p style="margin: 2px 0; font-size: 14px;"><strong>🚚 Envío a Domicilio</strong></p>
                            <p style="margin: 2px 0; font-size: 14px;">Dirección: ${payer.address.street_name}</p>
                            <p style="margin: 2px 0; font-size: 14px;">CP: ${payer.address.zip_code}</p>
                        </div>
                    `;
                } else {
                    infoEnvioHtml = `
                        <div style="background-color: #fff03b; color: #000; padding: 10px; text-align: center; border-radius: 4px;">
                            <strong>🏠 RETIRO EN SUCURSAL</strong>
                        </div>
                    `;
                }

                // --- EMAIL CLIENTE ---
                const itemsCliente = items.map(i => `
                    <tr>
                        <td style="padding:15px 0; border-bottom:1px solid #eeeeee;">
                            <span style="font-weight:bold; color:#333;">${i.title}</span>
                            <br><span style="font-size:12px; color:#777;">Cantidad: ${i.quantity}</span>
                        </td>
                        <td style="padding:15px 0; border-bottom:1px solid #eeeeee; text-align:right; white-space:nowrap; font-weight:bold;">
                            $${Number(i.unit_price).toLocaleString('es-AR')}
                        </td>
                    </tr>
                `).join('');

                const htmlCliente = `
                    <!DOCTYPE html>
                    <html>
                    <body style="margin:0; padding:0; background-color:#f4f4f4; font-family:'Helvetica Neue', Arial, sans-serif;">
                        <div style="max-width:600px; margin:40px auto; background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 15px rgba(0,0,0,0.05);">
                            
                            <!-- HEADER -->
                            <div style="background-color:#000000; padding:30px 20px; text-align:center;">
                                <img src="${LOGO_URL}" alt="Briago Pinturas" width="140" style="display:block; margin:0 auto;">
                            </div>
                            
                            <!-- BODY -->
                            <div style="padding:40px 30px;">
                                <h1 style="color:#333333; font-size:24px; margin:0 0 10px 0; text-align:center;">¡Gracias por tu compra!</h1>
                                <p style="color:#666666; font-size:16px; line-height:1.5; text-align:center; margin-bottom:30px;">
                                    Tu pedido <strong>#${extRef}</strong> ha sido confirmado con éxito.
                                </p>

                                <div style="background-color:#fffce6; border:1px solid #fff03b; border-radius:6px; padding:15px; margin-bottom:30px;">
                                    <h3 style="margin:0 0 10px 0; font-size:14px; color:#856404; text-transform:uppercase; letter-spacing:1px;">📦 Método de Entrega</h3>
                                    ${infoEnvioHtml}
                                </div>

                                <h3 style="border-bottom:2px solid #000; padding-bottom:10px; margin-top:0;">Resumen del Pedido</h3>
                                <table style="width:100%; border-collapse:collapse;">
                                    ${itemsCliente}
                                </table>

                                <div style="margin-top:20px; text-align:right;">
                                    <p style="font-size:14px; color:#666; margin:0;">Total Abonado</p>
                                    <p style="font-size:28px; font-weight:bold; color:#000; margin:5px 0;">${totalFormatted}</p>
                                </div>
                            </div>

                            <!-- FOOTER -->
                            <div style="background-color:#eeeeee; padding:20px; text-align:center; font-size:12px; color:#888;">
                                <p style="margin:0;">Briago Pinturas - Soluciones Industriales y Hogar</p>
                                <p style="margin:5px 0 0 0;">Ante cualquier duda, responde a este correo.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `;

                // --- EMAIL VENDEDOR ---
                const itemsVendedor = items.map(i => `
                    <li style="padding:5px 0; border-bottom:1px solid #eee;">
                        <strong>${i.quantity}x</strong> ${i.title}
                    </li>
                `).join('');

                const htmlVendedor = `
                    <!DOCTYPE html>
                    <html>
                    <body style="margin:0; padding:0; background-color:#eeeeee; font-family:'Helvetica Neue', Arial, sans-serif;">
                        <div style="max-width:600px; margin:40px auto; background-color:#ffffff; border-radius:8px; overflow:hidden; border-top: 6px solid #fff03b;">
                            
                            <div style="padding:30px; border-bottom:1px solid #eee;">
                                <div style="display:flex; justify-content:space-between; align-items:center;">
                                    <div>
                                        <h2 style="margin:0; font-size:22px; color:#000; text-transform:uppercase; letter-spacing:-0.5px;">🔴 NUEVA VENTA DETECTADA</h2>
                                        <p style="margin:5px 0 0 0; color:#666; font-size:14px;">ID de Referencia: <strong>#${extRef}</strong></p>
                                    </div>
                                    <div style="font-size:24px; font-weight:bold; color:#000;">
                                        ${totalFormatted}
                                    </div>
                                </div>
                            </div>

                            <div style="padding:30px;">
                                <div style="margin-bottom:30px;">
                                    <h3 style="font-size:13px; font-weight:bold; color:#999; text-transform:uppercase; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:5px;">👤 Datos del Cliente</h3>
                                    <div style="font-size:15px; color:#333; line-height:1.6;">
                                        <strong>Nombre:</strong> ${payer.name} ${payer.surname}<br>
                                        <strong>DNI:</strong> ${payer.identification?.number}<br>
                                        <strong>Teléfono:</strong> ${payer.phone?.area_code} ${payer.phone?.number}<br>
                                        <strong>Email:</strong> <a href="mailto:${payer.email}" style="color:#007bff; text-decoration:none;">${payer.email}</a>
                                    </div>
                                </div>

                                <div style="margin-bottom:30px;">
                                    <h3 style="font-size:13px; font-weight:bold; color:#999; text-transform:uppercase; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:5px;">🚚 Detalles de Envío / Retiro</h3>
                                    ${infoEnvioHtml}
                                </div>

                                <div>
                                    <h3 style="font-size:13px; font-weight:bold; color:#999; text-transform:uppercase; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:5px;">🛒 Productos Vendidos</h3>
                                    <ul style="list-style:none; padding:0; margin:0; font-size:15px; color:#333;">
                                        ${itemsVendedor}
                                    </ul>
                                </div>
                            </div>
                            
                            <div style="background-color:#f9f9f9; padding:15px; text-align:center; font-size:12px; color:#999;">
                                Sistema Automático de Ventas - Briago Pinturas
                            </div>
                        </div>
                    </body>
                    </html>
                `;

                // Enviamos los correos
                await resend.emails.send({
                    from: 'Briago Pinturas <ventas@briagopinturas.com>',
                    to: [payer.email],
                    subject: `Tu Pedido #${extRef} - Confirmado`,
                    html: htmlCliente
                });

                await resend.emails.send({
                    from: 'Sistema Web <ventas@briagopinturas.com>',
                    to: ['besadamateo@gmail.com'],
                    subject: `NUEVA VENTA #${extRef}`,
                    html: htmlVendedor
                });

                console.log(`✅ Emails enviados para orden ${extRef}`);
                pendingOrders.delete(extRef);
            }
        } catch (error) {
            console.error('❌ Error webhook:', error);
        }
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`✅ Servidor corriendo en puerto ${port}`);
    console.log(`🔗 Redirecciones configuradas hacia: ${process.env.CLIENT_URL || "https://briago-pinturas.com"}`);
});