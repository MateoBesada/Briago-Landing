import { useEffect } from "react";

const TerminosYCondiciones = () => {
useEffect(() => {
  window.scrollTo(0, 0);
}, []);

  return (
    <div className="bg-white min-h-screen w-full py-12 text-gray-800 leading-relaxed ">
      <div className="max-w-7xl text-sm mx-auto px-4">
        <h1 className="text-3xl mx-auto max-w-7xl md:text-4xl font-extrabold text-center mb-10 border-b-4 border-[#fff03b] inline-block pb-2">
          Términos y Condiciones de Uso
        </h1>

        <p className="mb-2 ">
          Bienvenido al sitio web de <strong>Briago Pinturas</strong>, perteneciente a{" "}
          <strong>PINTURERÍAS BRIAGO S.A.</strong>, CUIT <strong>30-71799269-1</strong>, con sede
          en Estanislao López 737, Pilar, Buenos Aires. Al acceder a este sitio web, el Usuario
          acepta cumplir con estos Términos y Condiciones, los cuales regulan el uso del sitio
          www.briagopinturas.com y las relaciones comerciales derivadas del mismo.
        </p>

        <h2 className="text-xl font-semibold mx-auto max-w-7xl mb-2">1. Aceptación del Usuario</h2>
        <p className="mb-2 ">
          El uso de este sitio implica la aceptación total de los presentes Términos y Condiciones.
          Si no estás de acuerdo con alguno de ellos, te pedimos que no utilices el sitio.
          El acceso, la navegación y las operaciones de compra suponen un acuerdo legal vinculante
          entre el Usuario y <strong>Briago Pinturas</strong>, regido por la legislación de la República Argentina.
        </p>

        <h2 className="text-xl font-semibold mx-auto max-w-7xl mb-2">2. Capacidad Legal</h2>
        <p className="mb-2 ">
          Solo pueden acceder y contratar los servicios personas mayores de edad con plena capacidad
          legal para obligarse. Los menores de edad o personas inhabilitadas por ley deberán abstenerse
          de utilizar este sitio. En caso de hacerlo, la responsabilidad recaerá sobre sus padres,
          tutores o representantes legales.
        </p>

        <h2 className="text-xl font-semibold mx-auto max-w-7xl mb-2">3. Registro y Protección de Datos</h2>
        <p className="mb-2 ">
          Para operar en el sitio, el Usuario deberá proporcionar datos reales, actuales y completos,
          incluyendo nombre, correo electrónico, teléfono y domicilio. Estos datos serán tratados bajo
          estricta confidencialidad conforme a la Ley 25.326 de Protección de Datos Personales.
          En cualquier momento, el Usuario podrá acceder, rectificar o eliminar sus datos escribiendo a{" "}
          <a href="mailto:briagopinturas@gmail.com" className="text-blue-600">
            briagopinturas@gmail.com
          </a>.
        </p>

        <h2 className="text-xl font-semibold mx-auto max-w-7xl mb-2">4. Modalidad de Compra</h2>
        <p className="mb-2 ">
          La disponibilidad de los productos, sus precios y las condiciones de compra están sujetas a
          modificaciones sin previo aviso. Todos los precios publicados se expresan en pesos argentinos,
          incluyen IVA, y son válidos exclusivamente para operaciones en línea. Las imágenes son
          ilustrativas y pueden diferir del producto real. El envío del formulario de contacto o
          pedido no implica aceptación automática por parte de <strong>Briago Pinturas</strong>; esta se
          concretará con la confirmación explícita del equipo comercial.
        </p>

        <h2 className="text-xl font-semibold mx-auto max-w-7xl mb-2">5. Medios de Pago</h2>
        <p className="mb-2 ">
          El sitio puede aceptar pagos en efectivo al momento de retirar, transferencia bancaria,
          Mercado Pago u otros métodos que serán oportunamente informados al momento de realizar el
          pedido. Ningún pedido será preparado ni entregado hasta que el pago esté validado. La
          verificación de pagos puede demorar hasta 48 horas hábiles, dependiendo del medio utilizado.
        </p>

        <h2 className="text-xl font-semibold mx-auto max-w-7xl mb-2">6. Cambios y Devoluciones</h2>
        <p className="mb-2">
          El Usuario podrá solicitar cambios o devoluciones dentro de un plazo máximo de 7 días
          corridos desde la compra, siempre que el producto se encuentre sin uso, en perfectas
          condiciones y en su empaque original. No se aceptarán devoluciones de productos a medida
          (por ejemplo, pinturas preparadas por sistema tintométrico). El cliente deberá presentar
          la factura o comprobante de compra. Para iniciar el trámite, deberá contactarse con
          nuestro equipo mediante correo electrónico o presencialmente en el local.
        </p>

        <h2 className="text-xl font-semibold mx-auto max-w-7xl mb-2">7. Propiedad Intelectual</h2>
        <p className="mb-2 ">
          Todos los contenidos presentes en el sitio web, incluyendo textos, imágenes, logotipos,
          nombres comerciales, diseño y código fuente son propiedad de <strong>Briago Pinturas</strong> o de
          terceros con autorización de uso. Está prohibida su reproducción total o parcial sin
          autorización escrita y expresa. El uso indebido será pasible de sanciones legales.
        </p>

        <h2 className="text-xl font-semibold mx-auto max-w-7xl mb-2">8. Limitación de Responsabilidad</h2>
        <p className="mb-2 ">
          <strong>Briago Pinturas</strong> no se responsabiliza por eventuales daños o perjuicios
          derivados del uso del sitio web, incluyendo interrupciones, demoras o fallas técnicas ajenas
          a la empresa. Asimismo, no garantiza la disponibilidad permanente del sitio ni la ausencia de
          errores o virus en el sistema. Se recomienda al Usuario mantener actualizado su navegador y
          sistemas de protección.
        </p>

        <h2 className="text-xl font-semibold mx-auto max-w-7xl mb-2">9. Comunicaciones</h2>
        <p className="mb-2 ">
          Toda comunicación formal del Usuario hacia <strong>Briago Pinturas</strong> deberá realizarse a
          través del correo electrónico{" "}
          <a href="mailto:briagopinturas@gmail.com" className="text-blue-600">
            briagopinturas@gmail.com
          </a>
          . Asimismo, la empresa podrá contactar al Usuario mediante el correo que haya
          proporcionado en el formulario, para responder consultas o enviar información comercial.
        </p>

        <h2 className="text-xl font-semibold mx-auto max-w-7xl mb-2">10. Legislación Aplicable y Jurisdicción</h2>
        <p className="mb-2 ">
          Los presentes Términos y Condiciones se interpretan conforme a las leyes de la República
          Argentina. Ante cualquier controversia, las partes se someterán a los tribunales ordinarios
          con competencia en la ciudad de Pilar, Provincia de Buenos Aires, renunciando a cualquier otro
          fuero que pudiera corresponder.
        </p>

        <p className="mt-10 italic text-sm ">
          Estos Términos y Condiciones pueden ser actualizados periódicamente. Se recomienda al Usuario
          revisarlos con frecuencia para estar al tanto de posibles modificaciones.
          <br />Última actualización: Julio de 2025. 
        </p>
      </div>
    </div>
  );
};

export default TerminosYCondiciones;
