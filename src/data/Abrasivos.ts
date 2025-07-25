import type { Producto } from "@/types/Producto";

export const productosAbrasivos: Producto[] = [
  {
  id: "113",
  nombre: "Discos Kovax En Seco Tela Granos",
  categoria: "Lijas",
  imagen: "/img/Otros/kovaxsuperBuflexDisco1.png",
  marca: "Kovax",
  abrasivo: 'Disco',
  descripcion: "Elija el grano que esta buscando",
  variantes: [
    {
      id: "83",
      nombre: "Lijas en Disco Kovax En Seco Tela Granos 2000",
      categoria: "Lijas",
      imagen: "/img/Abrasivos/buflexverde-prota.png",
      imgOpcionales: [
        "/img/Abrasivos/buflexverde-discos.png",
        "/img/Abrasivos/buflexverde-costado.png"
      ],
      precio: 10000,
      marca: "Kovax",
      abrasivo: 'Disco',
      grano: "2000",
      tipoVenta: {
        unidad: { precio: 1200 },
        caja: { precio: 10000, unidadesPorCaja: 10 },
        },
    },
    {
      id: "93",
      nombre: "Lijas en Disco Kovax En Seco Tela Granos 3000",
      categoria: "Lijas",
      imagen: "/img/Abrasivos/buflexnegro-prota.png",
      imgOpcionales: [
        "/img/Abrasivos/buflexnegro-discos.png",
        "/img/Abrasivos/buflexnegro-costado.png"
      ],
      precio: 12000,
      marca: "Kovax",
      abrasivo: 'Disco',
      grano: "3000",
      tipoVenta: {
        unidad: { precio: 1400 },
        caja: { precio: 12000, unidadesPorCaja: 10 },
        },
    },
    ]
  },
  {
    id: "13",
    nombre: "Lija En Tira Maxfilm Kovax 70mmx126mm Grano 80/600 X 25 Unid 600",

    categoria: "Lijas",
    imagen: "/img/Abrasivos/LijaEnTiraMaxfilmKovax70mmx126mm.png",
    marca:'Kovax'
  },
  {
    id: "63",
    nombre: "Lija En Tira Maxfilm Kovax 70mmx198mm Grano 80/600 Caja X 50 120",

    categoria: "Lijas",
    imagen: "/img/Abrasivos/LijaEnTiraMaxfilmKovax70mmx198mmGrano80.png",
    marca:'Kovax'
  },
  {
    id: "103",
    nombre: "Lija Tela Kovax Bufflex Y Assilex - Caja 25 Unidades K-3000",

    categoria: "Lijas",
    imagen: "/img/Abrasivos/superbuflexnegro.png",
    imgOpcionales: ["/img/Abrasivos/superbuflexnegro-lija.png"],
    marca:'Kovax',
    off: 8,
    precioOriginal: 14000,
    tipoVenta: {
      unidad: { precio: 600 },
      caja: { precio: 14000, unidadesPorCaja: 25 },
      },
  },
  {
    id: "23",
    nombre: "Lija Tela Kovax Bufflex Y Assilex - Caja 25 Unidades K-2000",

    categoria: "Lijas",
    imagen: "/img/Abrasivos/LijaTelaKovaxBufflexYAssilex-Caja25Unidades1000.png",
    imgOpcionales: ["/img/Abrasivos/superbuflexverde-lija.png"],
    marca:'Kovax'
  },
  {
  id: "73",
  nombre: "Lijas En Seco Kovax Tolecut 33x27 Mm Film X 8 Cortes",
  categoria: "Lijas",
  marca: "Kovax",
  imagen: "/img/Abrasivos/kovaxTolecut2.png",
  descripcion:"Elija el grano que esta buscando",
  abrasivo: 'Tela',
  variantes: [
    {
      id: "73-1500",
      nombre: "Lija En Seco Kovax Tolecut 33x27 Mm Film X 8 Cortes 1500",
      imagen: "/img/Abrasivos/Tolecutrosa.webp",
      categoria: "Lijas",
      
      marca: "Kovax",
      abrasivo: 'Tela',
      grano: "1500",
    },
    {
      id: "73-2000",
      nombre: "Lija En Seco Kovax Tolecut 33x27 Mm Film X 8 Cortes 2000",
      imagen: "/img/Abrasivos/Tolecutverde.webp",
      categoria: "Lijas",
      marca: "Kovax",
      abrasivo: 'Tela',
      grano: "2000",
    },
    {
      id: "73-3000",
      nombre: "Lija En Seco Kovax Tolecut 33x27 Mm Film X 8 Cortes 3000",
      imagen: "/img/Abrasivos/Tolecutnegro.jpg",
      categoria: "Lijas",
      marca: "Kovax",
      abrasivo: "Tela",
      grano: "3000", 
    }
  ]
},
];