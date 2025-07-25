import { supabase } from "@/lib/supabaseClient";
import { productosPinturas } from "@/data/Pinturas";

async function subirProductos() {
  for (const producto of productosPinturas) {
    const { error } = await supabase.from("productos").insert([producto]);
    if (error) {
      console.error("❌ Error al subir:", producto.nombre, error.message);
    } else {
      console.log("✅ Subido:", producto.nombre);
    }
  }
}

subirProductos();