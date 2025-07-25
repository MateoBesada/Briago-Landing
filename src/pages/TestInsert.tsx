import { supabase } from '@/lib/supabaseClient'

export default function TestInsert() {
  const insertarProducto = async () => {
    const nuevoProducto = {
      nombre: 'Lija al agua 3M',
      marca: '3M',
      precio: 1200,
      categoria: 'Abrasivos',
      stock: 15,
      imagenes: ['https://miweb.com/img1.jpg', 'https://miweb.com/img2.jpg'],
      especificaciones: { origen: 'Brasil', tipo: 'Al agua' },
    }

    const { data, error } = await supabase
      .from('productos')
      .insert([nuevoProducto])

    if (error) {
      console.error('❌ Error al insertar:', error)
    } else {
      console.log('✅ Producto insertado:', data)
    }
  }

  return (
    <div className="p-4">
      <button onClick={insertarProducto} className="bg-green-600 text-white px-4 py-2 rounded">
        Insertar producto de prueba
      </button>
    </div>
  )
}
