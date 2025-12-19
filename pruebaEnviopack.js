// pruebaEnviopack.js

// 1. TUS CREDENCIALES
// (Pegá aquí tus claves reales que me pasaste antes)
const API_KEY = '5b03aed6709c72d278990966958bd75c21bd049c';
const SECRET_KEY = '6dae2dc4dc4981f0d089e3de76b78d29d391f6e0';

// --- CONFIGURACIÓN "DUMMY" (Valores fijos para probar) ---
const PESO_FIJO = 1.0;
const MEDIDAS_FIJAS = '10x10x10'; // alto x ancho x largo

// Función principal
async function probarCotizacion(codigoPostalDestino, provinciaLetra) {
    try {
        console.log("1. Autenticando con EnvíoPack...");

        // PASO A: OBTENER EL TOKEN
        // ------------------------------------------------
        const authResponse = await fetch('https://api.enviopack.com/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                'api-key': API_KEY,
                'secret-key': SECRET_KEY
            })
        });

        if (!authResponse.ok) throw new Error("Error en autenticación. Chequeá tus claves.");
        const authData = await authResponse.json();
        const token = authData.token;

        console.log("-> Token recibido con éxito.\n");
        console.log(`2. Cotizando envío al CP: ${codigoPostalDestino}...`);

        // PASO B: COTIZAR
        // ------------------------------------------------
        const params = new URLSearchParams({
            access_token: token,
            provincia: provinciaLetra,
            codigo_postal: codigoPostalDestino,
            peso: PESO_FIJO,
            paquetes: MEDIDAS_FIJAS
        });

        // CORRECCIÓN AQUÍ: La ruta exacta es /cotizar/costo
        const cotizacionResponse = await fetch(`https://api.enviopack.com/cotizar/costo?${params}`);

        // Verificamos si la respuesta es correcta antes de leer el JSON
        if (!cotizacionResponse.ok) {
            const errorBody = await cotizacionResponse.text();
            throw new Error(`Error en la API (${cotizacionResponse.status}): ${errorBody}`);
        }

        const resultados = await cotizacionResponse.json();

        // PASO C: MOSTRAR RESULTADOS
        // ------------------------------------------------
        console.log("\n=== RESPUESTA DE LA API ===");

        // Si es un array, mostramos la lista linda
        if (Array.isArray(resultados)) {
            resultados.forEach(opcion => {
                // A veces viene 'correo' como objeto o string, prevenimos errores
                const nombreCorreo = opcion.correo.nombre || opcion.correo;
                const nombreServicio = opcion.servicio.nombre || opcion.servicio;

                console.log(`🚚 ${nombreCorreo} - ${nombreServicio}`);
                console.log(`   Precio: $${opcion.valor} | Entrega estimada: ${opcion.horas_entrega}hs`);
                console.log("--------------------------------");
            });
        } else {
            // Si no es array, mostramos el objeto crudo para ver qué pasó
            console.log(JSON.stringify(resultados, null, 2));
        }

    } catch (error) {
        console.error("\n❌ ALGO SALIÓ MAL:");
        console.error(error.message);
    }
}

// EJECUTAMOS LA PRUEBA
// '1704' es Ramos Mejía, 'B' es Buenos Aires
probarCotizacion('1704', 'B');