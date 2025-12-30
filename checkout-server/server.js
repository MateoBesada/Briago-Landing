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

const LOGO_URL = "https://briagopinturas.com/assets/LogoHeader-7HScdbpq.png";
const pendingOrders = new Map();

// RESTAURAMOS LAS CONSTANTES QUE FUNCIONABAN
const PESO_DEFAULT = 22.0;
const MEDIDAS_DEFAULT = '30x30x40';

// ---------------------------------------------------------
// ENDPOINT 1: COTIZADOR (RESTAURADO)
// ---------------------------------------------------------
app.post('/api/cotizar', async (req, res) => {
    try {
        const { codigo_postal, provincia } = req.body;
        console.log(`📡 Solicitud de cotización: CP ${codigo_postal}, Prov: ${provincia}`);

        const apiKey = process.env.ENVIOPACK_API_KEY;
        const secretKey = process.env.ENVIOPACK_SECRET_KEY;

        if (!apiKey || !secretKey) {
            console.error("❌ Faltan claves de EnvíoPack en Render");
            return res.status(500).json({ error: "Configuración incompleta" });
        }

        // 1. Auth
        const authResponse = await fetch('https://api.enviopack.com/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ 'api-key': apiKey, 'secret-key': secretKey })
        });

        if (!authResponse.ok) {
            const errorText = await authResponse.text();
            console.error(`❌ Error Auth EnvíoPack: ${errorText}`);
            throw new Error("Fallo autenticación con correo");
        }

        const { token } = await authResponse.json();

        // 2. Cotizar
        const params = new URLSearchParams({
            access_token: token,
            provincia: provincia,
            codigo_postal: codigo_postal,
            peso: PESO_DEFAULT, // Enviamos el número como antes
            paquetes: MEDIDAS_DEFAULT
        });

        const cotizacionResponse = await fetch(`https://api.enviopack.com/cotizar/costo?${params}`);

        if (!cotizacionResponse.ok) {
            const errorText = await cotizacionResponse.text();
            console.error(`❌ Error API Cotización: ${errorText}`);
            // Devolvemos array vacío para no romper el front
            return res.json([]);
        }

        const resultados = await cotizacionResponse.json();
        console.log(`✅ Cotización exitosa: ${resultados.length} opciones encontradas`);
        res.json(resultados);

    } catch (error) {
        console.error("❌ Error General Cotizador:", error.message);
        res.status(500).json({ error: "Error al cotizar envío" });
    }
});


// ---------------------------------------------------------
// ENDPOINT 2: CREAR PREFERENCIA (PRECIO REAL DEL FRONTEND)
// ---------------------------------------------------------
app.post('/create_preference', async (req, res) => {
    try {
        const { items, payer, external_reference } = req.body;
        console.log(`🛒 Nueva preferencia: ${external_reference}`);

        if (!items || !items.length) return res.status(400).json({ error: 'Carrito vacío' });

        // Usamos el precio que viene del frontend sin modificar
        const itemsProcesados = items.map(itemFrontend => ({
            title: itemFrontend.title,
            unit_price: Number(itemFrontend.unit_price),
            quantity: Number(itemFrontend.quantity),
            currency_id: 'ARS',
            picture_url: ''
        }));

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
// ENDPOINT 3: WEBHOOK (EMAIL FINAL)
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

                // Lógica de Envío/Retiro
                let infoEnvioHtml = '';
                const tieneDireccion = payer.address?.street_name && payer.address.street_name !== 'null';

                if (tieneDireccion) {
                    infoEnvioHtml = `
                        <p style="margin: 2px 0; font-size: 14px; color: #333;"><strong>Tipo:</strong> Envío a Domicilio</p>
                        <p style="margin: 2px 0; font-size: 14px; color: #333;"><strong>Dirección:</strong> ${payer.address.street_name}</p>
                        <p style="margin: 2px 0; font-size: 14px; color: #333;"><strong>CP:</strong> ${payer.address.zip_code}</p>
                    `;
                } else {
                    infoEnvioHtml = `
                        <div style="background-color: #fff03b; color: #000; padding: 10px; text-align: center; border-radius: 4px;">
                            <strong>RETIRO EN SUCURSAL</strong>
                        </div>
                    `;
                }

                // --- EMAIL CLIENTE ---
                const itemsCliente = items.map(i => `<tr><td style="padding:5px;">${i.title}</td><td style="text-align:right;">$${Number(i.unit_price).toLocaleString('es-AR')}</td></tr>`).join('');
                const htmlCliente = `
                    <div style="font-family:sans-serif; max-width:600px; margin:auto; border:1px solid #eee;">
                        <div style="background:#000; padding:20px; text-align:center;">
                            <img src="${LOGO_URL}" width="150" alt="Briago">
                        </div>
                        <div style="padding:20px;">
                            <h2>¡Gracias por tu compra, ${payer.name}!</h2>
                            <p>Tu pedido #${extRef} está confirmado.</p>
                            <table style="width:100%; margin:20px 0;">${itemsCliente}</table>
                            <h3 style="text-align:right;">Total: ${totalFormatted}</h3>
                        </div>
                    </div>
                `;

                // --- EMAIL VENDEDOR ---
                const itemsVendedor = items.map(i => `<li>${i.quantity}x ${i.title}</li>`).join('');
                const htmlVendedor = `
                    <div style="font-family:sans-serif; max-width:600px; margin:auto; border:1px solid #333;">
                        <div style="background:#fff03b; padding:15px; text-align:center;">
                            <h2 style="margin:0;">NUEVA VENTA WEB</h2>
                            <small>#${extRef}</small>
                        </div>
                        <div style="padding:20px;">
                            <h3>Datos Cliente:</h3>
                            <p>Nombre: ${payer.name} ${payer.surname}</p>
                            <p>DNI: ${payer.identification?.number}</p>
                            <p>Tel: ${payer.phone?.number}</p>
                            <p>Email: ${payer.email}</p>
                            <hr>
                            <h3>Envío:</h3>
                            ${infoEnvioHtml}
                            <hr>
                            <h3>Productos:</h3>
                            <ul>${itemsVendedor}</ul>
                            <h2 style="text-align:right;">Total: ${totalFormatted}</h2>
                        </div>
                    </div>
                `;

                await resend.emails.send({
                    from: 'Briago Pinturas <ventas@briagopinturas.com>',
                    to: [payer.email],
                    subject: `Tu pedido #${extRef}`,
                    html: htmlCliente
                });

                await resend.emails.send({
                    from: 'Sistema Web <ventas@briagopinturas.com>',
                    to: ['besadamateo@gmail.com'],
                    subject: `Nueva Venta #${extRef}`,
                    html: htmlVendedor
                });

                pendingOrders.delete(extRef);
            }
        } catch (error) {
            console.error(error);
        }
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`✅ Servidor corriendo en puerto ${port}`);
});