# 🌮 Sistema de Pedidos - Barbacoa Tatemada El Vale (Fase 2)

Bienvenido al módulo del **Sistema de Pedidos en Línea (Fase 2)** de Barbacoa Tatemada El Vale. Este sistema permite a tus clientes armar su pedido de forma visual desde su celular o computadora, rellenar sus datos de entrega y pago, y enviar el pedido completamente redactado y estructurado de forma directa a tu número de WhatsApp.

Este módulo se ha desarrollado de forma aislada, limpia y modular, asegurando no comprometer ni romper la landing page informativa principal.

---

## 📂 Estructura del Módulo

El sistema está autocontenido dentro de la carpeta `/sistema-pedidos/` con la siguiente estructu*   **`index.html`**: Estructura principal del sistema con semántica HTML5, optimizaciones SEO y accesibilidad móvil integradas.
*   **`pedidos.css`**: Estilos visuales optimizados para móviles (Mobile-First) con la paleta de colores del negocio (marrón oscuro, naranja quemado, crema, oro y blanco) y animaciones fluidas.
*   **`pedidos.js`**: Lógica de JavaScript puro que gestiona el carrito de compras, filtros, validaciones, carga dinámica del catálogo y sincronización en segundo plano con Google Sheets.
*   **`menu-data.js`**: Archivo de configuración del catálogo de productos. Permite realizar modificaciones rápidas de disponibilidad y precios.
*   **`admin.html`**: Panel de control administrativo interno con estadísticas, editor de catálogo y guía de integración con Google Sheets.
*   **`admin.js`**: Lógica del panel administrativo para autoguardado en `localStorage`, exportación dinámica de código y persistencia de configuraciones.
*   **`README.md`**: Este archivo con documentación y guía de pruebas piloto.

---

## 🛠️ Cómo Editar el Catálogo de Productos (`menu-data.js`)

Para agregar, quitar o editar productos del menú digital, puedes utilizar el **Panel de Administración** (`/sistema-pedidos/admin.html`) de forma visual e interactiva. Desde allí puedes descargar un archivo `menu-data.js` actualizado y sobrescribir el actual, o copiar el código directamente.

Si prefieres editar el archivo manualmente, cada elemento tiene el siguiente formato:

```javascript
{
  "id": "taco-barbacoa",
  "name": "Taco de barbacoa",
  "category": "Tacos",
  "description": "Taco con sabor tradicional de barbacoa.",
  "price": 40, // Usar un número cuando esté confirmado, o null para "Consultar precio"
  "available": true, // false para ocultar temporalmente del menú
  "popular": true // true para agregar el listón dorado distintivo "★ Más Vendido"
}
```

### Reglas importantes para la edición:
1.  **Categorías Disponibles**: `Órdenes`, `Tacos`, `Burritos`, `Sopes`, `Consomé`, `Extras`, `Bebidas`. El sistema agrupará y creará los botones de filtros automáticamente en base a estas categorías.
2.  **Manejo de Precios**: No inventar precios finales. Si un precio no está confirmado, mantén el valor `"price": null`. El sistema mostrará automáticamente `"Consultar precio"` en lugar de un costo aleatorio.

---

## 🧪 Lista de Verificación para Pruebas Piloto (Pilot Test Checklist)

Antes de anunciar de manera oficial la disponibilidad del sistema de pedidos en línea, te recomendamos realizar la siguiente serie de pruebas locales o en el servidor:

### 📱 1. Pruebas de Compatibilidad y Diseño
*   [ ] **Vista en Celular**: Abre el enlace de pedidos desde un dispositivo Android y un iPhone. Confirma que se puede hacer scroll correctamente, que las tarjetas de menú se ven en una columna limpia y que no hay desbordes horizontales.
*   [ ] **Barra de Carrito Móvil**: Agrega un producto desde el móvil y comprueba que aparece la barra flotante inferior indicando "Ver pedido". Ábrelo y confirma que el modal del carrito se despliega correctamente desde abajo.
*   [ ] **Vista en Computadora (Desktop)**: Confirma que la interfaz cambia a dos columnas (menú a la izquierda y carrito/formulario fijo a la derecha para un acceso rápido y cómodo).

### 🛒 2. Pruebas de Flujo del Carrito
*   [ ] **Agregar productos**: Añade varios productos de diferentes categorías al carrito.
*   [ ] **Incrementar / Decrementar cantidad**: Usa los botones `+` y `-` tanto en las tarjetas del menú como en el carrito. Verifica que se active el cambio visual interactivo.
*   [ ] **Eliminar productos**: Presiona el botón del bote de basura o reduce la cantidad a 0 y verifica que el producto desaparezca del carrito de forma correcta.
*   [ ] **Persistencia Local (LocalStorage)**: Agrega productos al carrito y recarga la página. Confirma que los artículos sigan en el carrito tras la recarga.

### 📝 3. Pruebas de Formulario y Validación
*   [ ] **Validación de campos vacíos**: Deja los campos vacíos e intenta presionar "Enviar pedido". El sistema debe mostrar una alerta flotante amigable pidiendo rellenar los datos.
*   [ ] **Aviso Condicional (Dirección)**: Selecciona "Para recoger" y confirma que el aviso de ubicación permanece oculto. Luego selecciona "A domicilio" y verifica que aparezca la caja de aviso (`.delivery-notice-box`) con animación fluida explicando que se solicitará la ubicación en tiempo real.
*   [ ] **Validación Condicional (Transferencia)**: Selecciona "Efectivo" de pago y confirma que el estado de transferencia esté oculto. Selecciona "Transferencia" y verifica que aparezca el selector obligatorio para indicar si ya se realizó o se realizará la transferencia.

### 💬 4. Pruebas de Conexión con WhatsApp
*   [ ] **Generación de Mensaje**: Rellena el formulario con datos de prueba, presiona el botón de envío y acepta la confirmación.
*   [ ] **Redirección**: Verifica que se abra una nueva pestaña que redireccione correctamente al API de WhatsApp de `Barbacoa Tatemada El Vale` (+52 631 105 2305) con el texto ya redactado y codificado.
*   [ ] **Lectura del Mensaje**: Confirma que el mensaje de WhatsApp muestre con absoluta claridad la lista de productos con su respectiva cantidad, el tipo de entrega elegido, el método de pago seleccionado y cualquier nota adicional que el usuario haya escrito.

---

## 📊 Integración con Google Sheets (CRM Gratuito)

¡El sistema cuenta con soporte completo y gratuito para almacenar tus pedidos directamente en una hoja de cálculo de Google! Esto funciona de fondo mediante un **Web App de Google Apps Script** totalmente privado y libre de cobros o suscripciones.

### Configuración Rápida en 3 Pasos:
1.  **Acceso al Panel de Administración**: Ve a `http://localhost:8000/sistema-pedidos/admin.html` (o `https://tu-dominio.vercel.app/sistema-pedidos/admin.html`).
2.  **Pestaña Google Sheets**: Ve a la pestaña **"Integración Google Sheets"** del panel.
3.  **Seguir la Guía**: Copia el código pre-generado y sigue las instrucciones en pantalla para desplegar tu script y guardar la URL resultante.

Una vez configurado, cada vez que un cliente complete su pedido y sea redirigido a WhatsApp, **toda la información del pedido se registrará automáticamente y en segundo plano en tu Google Sheets**, proporcionándote una base de datos segura y centralizada.

