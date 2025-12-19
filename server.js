import express from 'express';
import cors from 'cors';

const app = express();

// --- CONFIGURACIÓN ---
app.use(cors());
app.use(express.json());

// Ahora las lee de la configuración de Render (Variables de Entorno)
const API_KEY = process.env.ENVIOPACK_API_KEY;
const SECRET_KEY = process.env.ENVIOPACK_SECRET_KEY;

// Verificación de seguridad (para que te avise si te olvidaste de configurarlas)
if (!API_KEY || !SECRET_KEY) {
    console.error("❌ ERROR CRÍTICO: Faltan las claves de EnvíoPack en las variables de entorno.");
}

// DATOS FIJOS 
const PESO_DEFAULT = 22.0;
const MEDIDAS_DEFAULT = '30x30x40';

// --- LA RUTA ---
app.post('/api/cotizar', async (req, res) => {
    try {
        const { codigo_postal, provincia } = req.body;

        console.log(`📡 Recibiendo consulta para CP: ${codigo_postal} (${provincia})`);

        // 1. AUTENTICACIÓN
        const authResponse = await fetch('https://api.enviopack.com/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ 'api-key': API_KEY, 'secret-key': SECRET_KEY })
        });

        if (!authResponse.ok) throw new Error("Fallo la autenticación");
        const authData = await authResponse.json();
        const token = authData.token;

        // 2. COTIZACIÓN
        const params = new URLSearchParams({
            access_token: token,
            provincia: provincia,
            codigo_postal: codigo_postal,
            peso: PESO_DEFAULT,
            paquetes: MEDIDAS_DEFAULT
        });

        const cotizacionResponse = await fetch(`https://api.enviopack.com/cotizar/costo?${params}`);
        const resultados = await cotizacionResponse.json();

        // 3. RESPONDER
        res.json(resultados);

    } catch (error) {
        console.error("❌ Error:", error.message);
        res.status(500).json({ error: "Error al cotizar envío" });
    }
});

// --- ENCENDER EL SERVIDOR ---
const PUERTO = 3001;
app.listen(PUERTO, () => {
    console.log(`\n✅ SERVIDOR LISTO EN: http://localhost:${PUERTO}`);
    console.log(`Esperando consultas de tu web...`);
});