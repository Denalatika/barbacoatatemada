// Datos del menú oficial para el Sistema de Pedidos - Barbacoa Tatemada El Vale
// Basado en el menú físico oficial proporcionado

const MENU_DATA = [
  // Categoría: Órdenes / Platillos
  {
    "id": "orden-barbacoa",
    "name": "Orden de Barbacoa",
    "category": "Órdenes",
    "description": "Acompañado de taquitos de frijol doraditos y tortillas con asientos.",
    "price": 160,
    "image": "../assets/images/orden_familiar.png",
    "available": true,
    "popular": true
  },
  {
    "id": "media-barbacoa",
    "name": "Media de Barbacoa",
    "category": "Órdenes",
    "description": "Acompañado de taquitos de frijol doraditos y tortillas con asientos.",
    "price": 130,
    "image": "../assets/images/orden_familiar.png",
    "available": true,
    "popular": false
  },
  // Categoría: Tacos
  {
    "id": "tacos-sencillos",
    "name": "Tacos",
    "category": "Tacos",
    "description": "Preparados de Barbacoa, Cabeza o Chicharrón.",
    "price": 40,
    "image": "../assets/images/hero_barbacoa.png",
    "available": true,
    "popular": false
  },
  {
    "id": "taco-campechano",
    "name": "Taco Campechano",
    "category": "Tacos",
    "description": "Combinación de Barbacoa, Cabeza y Chicharrón.",
    "price": 60,
    "image": "../assets/images/hero_barbacoa.png",
    "available": true,
    "popular": false
  },
  {
    "id": "taco-fundido",
    "name": "Taco Fundido",
    "category": "Tacos",
    "description": "De Barbacoa, Cabeza o Chicharrón y queso gratinado.",
    "price": 60,
    "image": "../assets/images/taco_fundido_barbacoa.png",
    "available": true,
    "popular": true
  },
  {
    "id": "taco-charreado",
    "name": "Charreado",
    "category": "Tacos",
    "description": "Taco de Barbacoa, Cabeza o Chicharrón en costra de queso.",
    "price": 80,
    "image": "../assets/images/charreado_barbacoa.png",
    "available": true,
    "popular": true
  },
  // Categoría: Burritos / Sopes / Especialidades
  {
    "id": "tapatia",
    "name": "Tapatia",
    "category": "Sopes",
    "description": "Quesadilla de harina doradita con Barbacoa, frijol y queso gratinado.",
    "price": 100,
    "image": "../assets/images/tapatia_barbacoa.png",
    "available": true,
    "popular": true
  },
  {
    "id": "charro",
    "name": "Charro",
    "category": "Sopes",
    "description": "Quesadilla de maíz doradita con asientos, barbacoa y queso gratinado.",
    "price": 80,
    "image": "../assets/images/sopes_barbacoa.png",
    "available": true,
    "popular": false
  },
  {
    "id": "chapala",
    "name": "Chapala",
    "category": "Sopes",
    "description": "Tortilla de maíz doradita con queso gratinado y asientos.",
    "price": 15,
    "image": "../assets/images/chapala_especial_barbacoa.png",
    "available": true,
    "popular": false
  },
  {
    "id": "chapala-especial",
    "name": "Chapala Especial",
    "category": "Sopes",
    "description": "Tortilla de maíz doradita con queso gratinado, asientos, frijol y carne.",
    "price": 85,
    "image": "../assets/images/chapala_especial_barbacoa.png",
    "available": true,
    "popular": true
  },
  {
    "id": "burrito",
    "name": "Burrito",
    "category": "Burritos",
    "description": "De Barbacoa, Cabeza o Chicharrón en tortilla grande de harina.",
    "price": 50,
    "image": "../assets/images/tapatia_barbacoa.png",
    "available": true,
    "popular": false
  },
  // Categoría: Consomé / Bebidas
  {
    "id": "consome",
    "name": "Consomé Caliente",
    "category": "Consomé",
    "description": "Delicioso y sazonado consomé caliente tradicional de la casa.",
    "price": 30,
    "image": "../assets/images/consome_barbacoa.png",
    "available": true,
    "popular": false
  },
  {
    "id": "bebidas",
    "name": "Bebidas",
    "category": "Bebidas",
    "description": "Aguas frescas, café de olla y refresco frío.",
    "price": 30,
    "image": "../assets/images/aguas_frescas.png",
    "available": true,
    "popular": false
  },
  {
    "id": "mariachis",
    "name": "Mariachis",
    "category": "Especialidades",
    "description": "Preparado con costra de queso y chile verde tatemado con la carne de tu elección: Barbacoa, Cabeza o Chicharrón.",
    "price": 80,
    "image": "../assets/images/hero_barbacoa.png",
    "available": true,
    "popular": true
  },
  {
    "id": "chilaquiles-barbacoa",
    "name": "Chilaquiles",
    "category": "Especialidades",
    "description": "Bañados en salsa artesanal, coronados con abundante barbacoa tatemada, crema y queso fresco.",
    "price": 140,
    "image": "../assets/images/chilaquiles_barbacoa.png",
    "available": true,
    "popular": true
  },
  {
    "id": "birria-caldo",
    "name": "Birria en Caldo",
    "category": "Especialidades",
    "description": "Caldo reconfortante de birria tatemada con garbanzos, tierna carne y el sazón tradicional de la casa.",
    "price": 130,
    "image": "../assets/images/birria_en_caldo.png",
    "available": true,
    "popular": true
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MENU_DATA;
}
