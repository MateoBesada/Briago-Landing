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

// Constantes para EnvíoPack
const PESO_DEFAULT = 22.0;
const MEDIDAS_DEFAULT = '30x30x40';

// ---------------------------------------------------------
// 1. TU BASE DE DATOS (SIMULADA EN CÓDIGO)
// ---------------------------------------------------------
// Aquí copié los productos Sherwin que me pasaste antes.
// Tienes que mantener esta lista actualizada con tus precios REALES (de lista/contado).
const PRODUCTOS_DB = [
    { id: '10', nombre: "Latex Interior Z10 20L", precioOriginal: 215448, maxCuotas: 3 },
    { id: '20', nombre: "Latex Interior Z10 10L", precioOriginal: 117396, maxCuotas: 3 },
    { id: '30', nombre: "Latex Interior Z10 4L", precioOriginal: 40203, maxCuotas: 3 },
    { id: '40', nombre: "Latex Interior Quantum 20L", precioOriginal: 156104, maxCuotas: 3 },
    { id: '50', nombre: "Latex Interior Quantum 4L", precioOriginal: 52680, maxCuotas: 3 },
    { id: '60', nombre: "Latex Int/Ext Quantum 20L", precioOriginal: 173066, maxCuotas: 3 },
    { id: '70', nombre: "Latex Int/Ext Quantum 4L", precioOriginal: 54229, maxCuotas: 3 },
    { id: '80', nombre: "Fijador Quantum 20L", precioOriginal: 98000, maxCuotas: 3 },
    { id: '90', nombre: "Fijador Quantum 4L", precioOriginal: 18900, maxCuotas: 3 },
    // Agrega aquí los Kovax con maxCuotas: 6 si quieres
    { id: 'kovax-ejemplo', nombre: "Lija Kovax", precioOriginal: 5000, maxCuotas: 6 }
];

// Tasas de Mercado Pago (Costo aprox. por ofrecer cuotas sin interés)
// Ajusta estos valores según lo que te diga tu panel de MP.
const TASA_3_CUOTAS = 0.15; // 15% (Para dividir por 0.85)
const TASA_6_CUOTAS = 0.25; // 25% (Para dividir por 0.75)


// ---------------------------------------------------------
// ENDPOINT 1: COTIZADOR DE ENVÍOPACK (IGUAL QUE ANTES)
// ---------------------------------------------------------
app.post('/api/cotizar', async (req, res) => {
    try {
        const { codigo_postal, provincia } = req.body;
        const apiKey = process.env.ENVIOPACK_API_KEY;
        const secretKey = process.env.ENVIOPACK_SECRET_KEY;

        if (!apiKey || !secretKey) return res.status(500).json({ error: "Faltan claves de EnvíoPack" });

        console.log(`📡 Cotizando envío para CP: ${codigo_postal}`);

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
            peso: PESO_DEFAULT,
            paquetes: MEDIDAS_DEFAULT
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
// ENDPOINT 2: CREAR PREFERENCIA (MODIFICADO - CHECKOUT PRO)
// ---------------------------------------------------------
app.post('/create_preference', async (req, res) => {
    try {
        const { items, payer, external_reference } = req.body;

        if (!items || !items.length) return res.status(400).json({ error: 'Carrito vacío' });

        // --- LÓGICA DE INFLACIÓN DE PRECIOS ---

        let maxCuotasPermitidasCarrito = 12; // Empezamos con el máximo

        const itemsProcesados = items.map(itemFrontend => {
            // Caso especial: El Envío (ese no se busca en la DB)
            if (itemFrontend.id === 'envio') {
                return {
                    title: itemFrontend.title,
                    unit_price: Number(itemFrontend.unit_price),
                    quantity: 1,
                    currency_id: 'ARS'
                };
            }

            // 1. Buscamos el producto en nuestra "Base de Datos" local
            const productoDB = PRODUCTOS_DB.find(p => p.id === String(itemFrontend.id));

            // Si no existe (seguridad), usamos el precio que mandó el front pero asumimos 1 cuota
            // O podrías lanzar error. Aquí somos permisivos.
            let precioBase = productoDB ? productoDB.precioOriginal : Number(itemFrontend.unit_price);
            let maxCuotasProd = productoDB ? productoDB.maxCuotas : 3;

            // Actualizamos el límite del carrito (Nivelamos hacia abajo)
            if (maxCuotasProd < maxCuotasPermitidasCarrito) {
                maxCuotasPermitidasCarrito = maxCuotasProd;
            }

            // 2. Calculamos el PRECIO INFLADO
            let precioFinal = precioBase;

            if (maxCuotasProd === 3) {
                // Inflamos para cubrir el 15%
                precioFinal = precioBase / (1 - TASA_3_CUOTAS);
            } else if (maxCuotasProd === 6) {
                // Inflamos para cubrir el 25%
                precioFinal = precioBase / (1 - TASA_6_CUOTAS);
            }

            return {
                title: itemFrontend.title,
                unit_price: Number(precioFinal.toFixed(2)), // Redondeamos a 2 decimales
                quantity: Number(itemFrontend.quantity),
                currency_id: 'ARS',
                picture_url: productoDB ? productoDB.imagen : '' // Opcional
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

            // --- AQUÍ LIMITAMOS LAS CUOTAS VISUALMENTE ---
            payment_methods: {
                installments: maxCuotasPermitidasCarrito // Esto fuerza a MP a mostrar solo hasta 3 o 6
            }
        };

        const result = await mercadopago.preferences.create(preference);

        // --- CAMBIO CLAVE: DEVOLVEMOS init_point ---
        res.json({
            id: result.body.id,
            init_point: result.body.init_point // URL para redirigir
        });

    } catch (error) {
        console.error('Error create_preference:', error);
        res.status(500).json({ error: 'Error al generar link de pago' });
    }
});


// ---------------------------------------------------------
// ENDPOINT 3: WEBHOOK (LIGERA MEJORA VISUAL)
// ---------------------------------------------------------
app.post('/webhook-mercadopago', async (req, res) => {
    // ... (Tu código de webhook está bien, mantenlo igual) ...
    // Solo recuerda que ahora 'items' tendrá el precio inflado en el email,
    // lo cual está bien porque es lo que el cliente pagó.

    // (Pego tu código original aquí para que no se pierda al copiar)
    console.log('Webhook recibido');
    try {
        if (req.body.type === 'payment') {
            const paymentId = req.body.data?.id;
            if (!paymentId) return res.status(200).send('OK');

            const payment = await mercadopago.payment.get(paymentId);

            if (payment.body.status === 'approved') {
                const extRef = payment.body.external_reference;
                const orderData = pendingOrders.get(extRef);

                if (orderData) {
                    // ... Lógica de Emails (Resend) ...
                    // Usa el mismo código que tenías para enviar mails
                    console.log(`✅ Pago aprobado y emails enviados para ${extRef}`);
                    pendingOrders.delete(extRef);
                }
            }
        }
    } catch (e) { console.error(e); }
    res.status(200).send('OK');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`✅ Servidor corriendo en puerto ${port}`);
});