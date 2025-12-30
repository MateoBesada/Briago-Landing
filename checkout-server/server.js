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

// LOGO DE LA EMPRESA
const LOGO_URL = "https://briagopinturas.com/assets/LogoHeader-7HScdbpq.png";

// ALMACÉN TEMPORAL DE ÓRDENES
const pendingOrders = new Map();

// ---------------------------------------------------------
// 1. BASE DE DATOS DE PRECIOS (Recuerda mantener estos precios actualizados)
// ---------------------------------------------------------
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
        console.error("Error al cotizar:", error.message);
        res.status(500).json({ error: "Error al cotizar envío" });
    }
});


// ---------------------------------------------------------
// ENDPOINT 2: CREAR PREFERENCIA
// ---------------------------------------------------------
app.post('/create_preference', async (req, res) => {
    try {
        const { items, payer, external_reference } = req.body;
        console.log(`Nueva solicitud: ${external_reference}`);

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

        // Guardamos datos
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
        console.error('Error create_preference:', error);
        res.status(500).json({ error: 'Error al generar link de pago' });
    }
});


// ---------------------------------------------------------
// ENDPOINT 3: WEBHOOK (EMAILS PROFESIONALES)
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

                // --- 1. LÓGICA DE DIRECCIÓN / RETIRO ---
                // Si el campo de calle está vacío o undefined, asumimos que es Retiro en Tienda
                let infoEnvioHtml = '';
                const tieneDireccion = payer.address?.street_name && payer.address.street_name.trim() !== '' && payer.address.street_name !== 'null';

                if (tieneDireccion) {
                    infoEnvioHtml = `
                        <p style="margin: 2px 0; font-size: 14px; color: #333;"><strong>Tipo:</strong> Envío a Domicilio</p>
                        <p style="margin: 2px 0; font-size: 14px; color: #333;"><strong>Dirección:</strong> ${payer.address.street_name}</p>
                        <p style="margin: 2px 0; font-size: 14px; color: #333;"><strong>CP / Localidad:</strong> ${payer.address.zip_code}</p>
                    `;
                } else {
                    // Diseño destacado para Retiro
                    infoEnvioHtml = `
                        <div style="background-color: #fff03b; color: #000; padding: 10px; text-align: center; border-radius: 4px; margin-top: 5px;">
                            <strong style="font-size: 16px; text-transform: uppercase;">RETIRO EN SUCURSAL</strong>
                            <p style="margin: 5px 0 0 0; font-size: 12px;">El cliente retirará el pedido en el local.</p>
                        </div>
                    `;
                }

                // -----------------------------------------------------
                // 2. DISEÑO EMAIL CLIENTE
                // -----------------------------------------------------
                const clienteItemsHtml = items.map(item => `
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #333; font-size: 14px;">${item.title}</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: center; color: #333; font-size: 14px;">${item.quantity}</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; font-weight: bold; color: #333; font-size: 14px;">$${Number(item.unit_price).toLocaleString('es-AR')}</td>
                    </tr>
                `).join('');

                const htmlCliente = `
                <!DOCTYPE html>
                <html>
                <body style="margin:0; padding:0; background-color:#f4f4f4; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                        <div style="background-color: #000000; padding: 30px; text-align: center;">
                            <img src="${LOGO_URL}" alt="Briago Pinturas" width="180" style="display: block; margin: 0 auto; max-width: 100%;">
                        </div>
                        
                        <div style="padding: 40px 30px;">
                            <h2 style="color: #000; margin-top: 0; font-size: 20px;">Confirmación de Pedido</h2>
                            <p style="color: #555; line-height: 1.6; font-size: 15px;">Hola ${payer.name}, gracias por tu compra. Hemos recibido tu pago y estamos procesando tu pedido.</p>
                            
                            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 25px 0; border: 1px solid #eee;">
                                <p style="margin: 0; font-size: 14px; color: #555;"><strong>Referencia:</strong> #${extRef}</p>
                            </div>

                            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                                <thead>
                                    <tr>
                                        <th style="text-align: left; color: #999; font-size: 11px; text-transform: uppercase; border-bottom: 2px solid #eee; padding-bottom: 10px;">Producto</th>
                                        <th style="text-align: center; color: #999; font-size: 11px; text-transform: uppercase; border-bottom: 2px solid #eee; padding-bottom: 10px;">Cant.</th>
                                        <th style="text-align: right; color: #999; font-size: 11px; text-transform: uppercase; border-bottom: 2px solid #eee; padding-bottom: 10px;">Precio</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${clienteItemsHtml}
                                </tbody>
                            </table>

                            <div style="margin-top: 20px; text-align: right; border-top: 2px solid #000; padding-top: 15px;">
                                <span style="font-size: 14px; color: #666; margin-right: 15px;">Total Pagado:</span>
                                <span style="font-size: 24px; font-weight: bold; color: #000;">${totalFormatted}</span>
                            </div>

                            <div style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
                                <p style="color: #999; font-size: 12px; margin: 0;">Briago Pinturas</p>
                                <p style="color: #ccc; font-size: 11px; margin-top: 5px;">Este es un correo automático, por favor no respondas a esta dirección.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
                `;

                // -----------------------------------------------------
                // 3. DISEÑO EMAIL VENDEDOR (OPERATIVO)
                // -----------------------------------------------------
                const vendedorItemsHtml = items.map(item => `
                    <li style="margin-bottom: 8px; font-size: 14px; color: #333;">
                        <strong>${item.quantity}x</strong> ${item.title}
                    </li>
                `).join('');

                const htmlVendedor = `
                <!DOCTYPE html>
                <html>
                <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
                    <div style="max-width: 550px; margin: 0 auto; background-color: #fff; padding: 0; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                        
                        <div style="background-color: #000; color: #fff; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center;">
                            <h2 style="margin: 0; font-size: 18px; color: #fff03b;">NUEVA VENTA WEB</h2>
                            <span style="font-size: 14px; opacity: 0.8;">#${extRef}</span>
                        </div>

                        <div style="padding: 25px;">
                            
                            <h3 style="margin: 0 0 10px 0; font-size: 15px; text-transform: uppercase; color: #999; border-bottom: 1px solid #eee; padding-bottom: 5px;">Datos del Cliente</h3>
                            <div style="margin-bottom: 25px;">
                                <p style="margin: 3px 0; font-size: 14px;"><strong>Nombre:</strong> ${payer.name} ${payer.surname}</p>
                                <p style="margin: 3px 0; font-size: 14px;"><strong>DNI:</strong> ${payer.identification?.number || '-'}</p>
                                <p style="margin: 3px 0; font-size: 14px;"><strong>Teléfono:</strong> <a href="tel:${payer.phone?.number}" style="color: #000; text-decoration: none;">${payer.phone?.number || '-'}</a></p>
                                <p style="margin: 3px 0; font-size: 14px;"><strong>Email:</strong> ${payer.email}</p>
                            </div>

                            <h3 style="margin: 0 0 10px 0; font-size: 15px; text-transform: uppercase; color: #999; border-bottom: 1px solid #eee; padding-bottom: 5px;">Método de Entrega</h3>
                            <div style="margin-bottom: 25px;">
                                ${infoEnvioHtml}
                            </div>

                            <h3 style="margin: 0 0 10px 0; font-size: 15px; text-transform: uppercase; color: #999; border-bottom: 1px solid #eee; padding-bottom: 5px;">Detalle del Pedido</h3>
                            <ul style="padding-left: 20px; margin-top: 10px;">
                                ${vendedorItemsHtml}
                            </ul>
                            
                            <div style="text-align: right; margin-top: 20px; padding-top: 15px; border-top: 2px solid #000;">
                                <p style="font-size: 14px; color: #666; margin: 0;">Total Cobrado:</p>
                                <p style="font-size: 22px; font-weight: bold; margin: 5px 0 0 0;">${totalFormatted}</p>
                            </div>

                        </div>
                    </div>
                </body>
                </html>
                `;

                // -----------------------------------------------------
                // 4. ENVIAR CORREOS
                // -----------------------------------------------------

                // Al Cliente
                await resend.emails.send({
                    from: 'Briago Pinturas <ventas@briagopinturas.com>',
                    to: [payer.email],
                    subject: `Confirmación de Pedido #${extRef}`,
                    html: htmlCliente
                });

                // Al Vendedor (Tú)
                await resend.emails.send({
                    from: 'Sistema Web <ventas@briagopinturas.com>',
                    to: ['besadamateo@gmail.com'],
                    subject: `Nueva Venta Web #${extRef}`,
                    html: htmlVendedor
                });

                console.log(`Emails enviados para orden ${extRef}`);
                pendingOrders.delete(extRef);
            }
        } catch (error) {
            console.error('Error procesando webhook:', error);
        }
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor corriendo en puerto ${port}`);
});