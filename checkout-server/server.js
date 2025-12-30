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
                const itemsCliente = items.map(i => `<tr><td style="padding:8px 0; border-bottom:1px solid #eee;">${i.title}</td><td style="padding:8px 0; border-bottom:1px solid #eee; text-align:right;">$${Number(i.unit_price).toLocaleString('es-AR')}</td></tr>`).join('');

                const htmlCliente = `
                    <div style="font-family:sans-serif; max-width:600px; margin:auto; border:1px solid #eee;">
                        <div style="background:#000; padding:20px; text-align:center;">
                            <img src="${LOGO_URL}" width="150" alt="Briago">
                        </div>
                        <div style="padding:30px;">
                            <h2 style="margin-top:0;">¡Gracias por tu compra!</h2>
                            <p>Tu pedido <strong>#${extRef}</strong> ha sido confirmado.</p>
                            
                            <table style="width:100%; margin:20px 0; border-collapse: collapse;">
                                ${itemsCliente}
                            </table>
                            
                            <h3 style="text-align:right; border-top: 2px solid #000; padding-top:10px;">Total: ${totalFormatted}</h3>
                            
                            <p style="font-size:12px; color:#999; margin-top:30px; text-align:center;">Briago Pinturas</p>
                        </div>
                    </div>
                `;

                // --- EMAIL VENDEDOR ---
                const itemsVendedor = items.map(i => `<li>${i.quantity}x ${i.title}</li>`).join('');

                const htmlVendedor = `
                    <div style="font-family:sans-serif; max-width:600px; margin:auto; border:1px solid #333;">
                        <div style="background:#fff03b; padding:15px; text-align:center;">
                            <h2 style="margin:0;">NUEVA VENTA WEB</h2>
                            <small>Ref: #${extRef}</small>
                        </div>
                        <div style="padding:20px;">
                            <h3>👤 Cliente:</h3>
                            <p><strong>Nombre:</strong> ${payer.name} ${payer.surname}</p>
                            <p><strong>DNI:</strong> ${payer.identification?.number}</p>
                            <p><strong>Tel:</strong> ${payer.phone?.number}</p>
                            <p><strong>Email:</strong> ${payer.email}</p>
                            
                            <hr style="border:0; border-top:1px solid #eee; margin:15px 0;">
                            
                            <h3>📦 Entrega:</h3>
                            ${infoEnvioHtml}
                            
                            <hr style="border:0; border-top:1px solid #eee; margin:15px 0;">
                            
                            <h3>🛒 Productos:</h3>
                            <ul>${itemsVendedor}</ul>
                            
                            <h2 style="text-align:right;">Cobrado: ${totalFormatted}</h2>
                        </div>
                    </div>
                `;

                // Enviamos los correos
                await resend.emails.send({
                    from: 'Briago Pinturas <ventas@briagopinturas.com>',
                    to: [payer.email],
                    subject: `Tu Pedido #${extRef}`,
                    html: htmlCliente
                });

                await resend.emails.send({
                    from: 'Sistema Web <ventas@briagopinturas.com>',
                    to: ['besadamateo@gmail.com'],
                    subject: `Nueva Venta #${extRef}`,
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