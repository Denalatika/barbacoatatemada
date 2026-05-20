// Lógica del Panel de Administración - Barbacoa Tatemada El Vale

let currentMenu = [];
const categories = ['Órdenes', 'Tacos', 'Burritos', 'Sopes', 'Consomé', 'Extras', 'Bebidas'];

// Elementos del DOM
const tbody = document.getElementById('admin-table-tbody');
const statTotal = document.getElementById('stat-total');
const statActive = document.getElementById('stat-active');
const statPopular = document.getElementById('stat-popular');
const menuCodeBlock = document.getElementById('menu-data-code-block');
const sheetsUrlInput = document.getElementById('sheets_api_url');
const sheetsStatusCard = document.getElementById('sheets-status-card');

document.addEventListener('DOMContentLoaded', () => {
    // 1. Cargar datos del catálogo (preferir local storage si hay cambios guardados)
    loadMenuData();
    
    // 2. Cargar configuración de Google Sheets
    loadSheetsConfig();
    
    // 3. Cargar configuración de datos bancarios
    loadBankDetails();
    
    // 4. Renderizar la tabla de edición
    renderAdminTable();
    
    // 5. Actualizar estadísticas de negocio y código a exportar
    updateStats();
    generateExportCode();
});

// Cambiar de pestañas (Tabs)
window.switchTab = function(tabId, buttonEl) {
    // Quitar active de botones
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    // Quitar active de contenidos
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Activar pestaña elegida
    buttonEl.classList.add('active');
    document.getElementById(tabId).classList.add('active');
};

// Cargar menú
function loadMenuData() {
    const savedMenu = localStorage.getItem('valetatemada_custom_menu');
    if (savedMenu) {
        try {
            currentMenu = JSON.parse(savedMenu);
            // Sincronizar catálogo guardado con el oficial por si se agregaron nuevos productos oficiales
            let updated = false;
            MENU_DATA.forEach(officialProd => {
                const exists = currentMenu.some(p => p.id === officialProd.id);
                if (!exists) {
                    currentMenu.push(officialProd);
                    updated = true;
                }
            });
            if (updated) {
                localStorage.setItem('valetatemada_custom_menu', JSON.stringify(currentMenu));
            }
        } catch (e) {
            console.error("Error al parsear menú guardado localmente:", e);
            currentMenu = [...MENU_DATA];
        }
    } else {
        currentMenu = [...MENU_DATA];
    }
}

// Cargar configuración de Sheets
function loadSheetsConfig() {
    const savedUrl = localStorage.getItem('valetatemada_sheets_url');
    if (savedUrl) {
        if (sheetsUrlInput) sheetsUrlInput.value = savedUrl;
        if (sheetsStatusCard) sheetsStatusCard.style.display = 'flex';
    } else {
        if (sheetsStatusCard) sheetsStatusCard.style.display = 'none';
    }
}

// Guardar URL de Sheets
window.saveSheetsUrl = function() {
    if (!sheetsUrlInput) return;
    
    const url = sheetsUrlInput.value.trim();
    if (url === '') {
        localStorage.removeItem('valetatemada_sheets_url');
        if (sheetsStatusCard) sheetsStatusCard.style.display = 'none';
        showToast("Configuración de Google Sheets limpiada.");
    } else if (url.startsWith('https://script.google.com/')) {
        localStorage.setItem('valetatemada_sheets_url', url);
        if (sheetsStatusCard) sheetsStatusCard.style.display = 'flex';
        showToast("¡URL de Google Sheets guardada con éxito!");
    } else {
        alert("Por favor ingresa una URL válida de Google Apps Script Web App.\nDebe comenzar con: https://script.google.com/");
    }
};

// Probar conexión con Google Sheets
window.testSheetsConnection = function() {
    if (!sheetsUrlInput) return;
    
    const url = sheetsUrlInput.value.trim();
    if (url === '') {
        alert("Por favor ingresa primero la URL de tu Google Apps Script en el campo de arriba.");
        return;
    }
    
    if (!url.startsWith('https://script.google.com/')) {
        alert("La URL no es válida. Debe comenzar con https://script.google.com/");
        return;
    }
    
    const btnTest = document.getElementById('btn-test-sheets');
    const diagBox = document.getElementById('sheets-diagnostic-box');
    
    if (btnTest) {
        btnTest.disabled = true;
        btnTest.innerText = "⏳ Probando conexión...";
        btnTest.style.opacity = "0.7";
    }
    
    if (diagBox) {
        diagBox.style.display = "block";
        diagBox.style.backgroundColor = "#FFF3CD";
        diagBox.style.borderColor = "#FFC107";
        diagBox.style.color = "#664d03";
        diagBox.innerHTML = `
            <strong>🔄 Iniciando prueba de comunicación...</strong><br>
            Enviando un pedido de prueba en tiempo real a tu Google Sheets Web App. Esto toma unos segundos...
        `;
    }
    
    const testPayload = {
        customer_name: "SOPORTE TÉCNICO (Fila de Prueba)",
        customer_phone: "0000000000",
        customer_dob: "1990-01-01",
        delivery_type: "A domicilio",
        address: "Prueba desde Panel de Control de Administrador",
        location_link: "https://maps.google.com/test",
        payment_method: "Transferencia",
        transfer_status: "Pendiente de validar",
        order_total: "$999.00",
        order_items: "- 1 u. x PRUEBA DE CONEXIÓN EXITOSA ($999.00)\n",
        notes: "Esta es una fila de prueba generada automáticamente para validar la sincronización correcta con Google Sheets."
    };
    
    // Configurar un timeout de 12 segundos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    
    fetch(url, {
        method: 'POST',
        mode: 'cors',
        redirect: 'follow',
        headers: {
            'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(testPayload),
        signal: controller.signal
    })
    .then(response => {
        clearTimeout(timeoutId);
        return response.json();
    })
    .then(data => {
        if (btnTest) {
            btnTest.disabled = false;
            btnTest.innerText = "⚡️ Probar Conexión (Enviar Fila de Prueba)";
            btnTest.style.opacity = "1";
        }
        
        if (data && data.status === "success") {
            // Guardar automáticamente la URL exitosa en localStorage
            localStorage.setItem('valetatemada_sheets_url', url);
            if (sheetsStatusCard) sheetsStatusCard.style.display = 'flex';
            
            if (diagBox) {
                diagBox.style.backgroundColor = "#D1E7DD";
                diagBox.style.borderColor = "#BADBCC";
                diagBox.style.color = "#0F5132";
                diagBox.innerHTML = `
                    <strong>🟢 ¡Conexión exitosa con tu Google Sheets!</strong><br>
                    El script de Google respondió con éxito. Se ha insertado correctamente la fila de prueba: <strong>'SOPORTE TÉCNICO (Fila de Prueba)'</strong>.<br><br>
                    <strong>¡Felicidades!</strong> Tu base de datos está enlazada al 100% y capturará de forma automática y gratuita todos los pedidos que tus clientes hagan desde sus celulares, iPads y computadoras.
                `;
            }
            showToast("¡Conexión probada y guardada con éxito!");
        } else {
            // Caso en el que el script responde pero tiene un error interno
            const errMsg = data ? data.message : "Error desconocido en el script";
            if (diagBox) {
                diagBox.style.backgroundColor = "#F8D7DA";
                diagBox.style.borderColor = "#F5C2C7";
                diagBox.style.color = "#842029";
                diagBox.innerHTML = `
                    <strong>🔴 Error Interno en tu Apps Script:</strong><br>
                    Tu servidor de Google Apps Script se comunicó pero falló al procesar el archivo. El error devuelto es:<br>
                    <code style="background: rgba(0,0,0,0.05); padding: 0.2rem 0.4rem; border-radius: 4px; display: inline-block; margin-top: 0.3rem;">${errMsg}</code><br><br>
                    <strong>Cómo solucionarlo:</strong>
                    <ol style="margin-top: 0.5rem; padding-left: 1.2rem;">
                        <li>Asegúrate de que no eliminaste ni cambiaste el nombre de la pestaña <strong>"Pedidos"</strong> en tu hoja de cálculo.</li>
                        <li>Si creaste el script directamente en Google Drive de forma independiente (no desde Extensiones > Apps Script de tu hoja), asegúrate de haber pegado el ID de tu hoja de cálculo en la variable <code>SPREADSHEET_ID</code> en la línea 9 de tu script.</li>
                    </ol>
                `;
            }
        }
    })
    .catch(error => {
        clearTimeout(timeoutId);
        if (btnTest) {
            btnTest.disabled = false;
            btnTest.innerText = "⚡️ Probar Conexión (Enviar Fila de Prueba)";
            btnTest.style.opacity = "1";
        }
        
        console.error("Error en la conexión de Sheets:", error);
        
        let diagnosticMsg = "";
        
        if (error.name === 'AbortError') {
            diagnosticMsg = `
                <strong>🔴 Tiempo de Espera Agotado (Timeout):</strong><br>
                La petición tardó más de 12 segundos en responder. Esto suele ocurrir si los servidores de Google están congestionados o si el Apps Script está colgado procesando otra petición.<br><br>
                <strong>Recomendación:</strong> Vuelve a intentar en unos momentos. Si el error persiste, comprueba que tu hoja de cálculo de Google Drive abre normalmente.
            `;
        } else {
            diagnosticMsg = `
                <strong>🔴 Error de Red o Bloqueo de CORS Detectado:</strong><br>
                El navegador bloqueó la conexión a tu Apps Script. Esto ocurre principalmente por un tema de permisos y seguridad de Google.<br><br>
                <strong>Cómo solucionarlo en 4 sencillos pasos:</strong>
                <ol style="margin-top: 0.5rem; padding-left: 1.2rem; line-height: 1.6;">
                    <li>Abre tu editor de Google Apps Script.</li>
                    <li>Haz click en el botón azul <strong>"Implementar"</strong> (Deploy) arriba a la derecha, luego selecciona <strong>"Nueva implementación"</strong> (New Deployment). <em>(No uses "Probar implementaciones", debe ser una implementación activa).</em></li>
                    <li>En la configuración de la Aplicación Web, asegúrate de configurar obligatoriamente:
                        <ul style="margin-top: 0.3rem; margin-bottom: 0.3rem;">
                            <li><strong>Ejecutar como:</strong> Tú (tu cuenta de correo)</li>
                            <li><strong>Quién tiene acceso:</strong> <strong style="color: #9e1c1c;">Cualquiera (Anyone)</strong></li>
                        </ul>
                        Si dejas "Solo yo" (Only me), Google bloqueará las conexiones de tus clientes o navegadores externos.
                    </li>
                    <li>Haz click en <strong>Implementar</strong>, otorga todos los permisos de seguridad de Google si te los solicita, y <strong>copia la nueva URL generada</strong>. Pégala en el campo gris arriba de esta página y vuelve a probar.</li>
                </ol>
            `;
        }
        
        if (diagBox) {
            diagBox.style.backgroundColor = "#F8D7DA";
            diagBox.style.borderColor = "#F5C2C7";
            diagBox.style.color = "#842029";
            diagBox.innerHTML = diagnosticMsg;
        }
    });
};

// Renderizar tabla
function renderAdminTable() {
    if (!tbody) return;
    tbody.innerHTML = '';
    
    currentMenu.forEach((product, index) => {
        const tr = document.createElement('tr');
        tr.id = `row-${index}`;
        
        // Selector de Categoría
        let catOptions = '';
        categories.forEach(cat => {
            catOptions += `<option value="${cat}" ${product.category === cat ? 'selected' : ''}>${cat}</option>`;
        });
        
        const imageUrl = product.image || '../assets/images/logo.png';
        const priceVal = product.price !== null ? product.price : '';
        
        tr.innerHTML = `
            <td>
                <img src="${imageUrl}" class="product-thumb" id="thumb-${index}" onerror="this.src='../assets/images/logo.png'">
            </td>
            <td>
                <input type="text" class="admin-input" value="${product.name}" onchange="updateProductField(${index}, 'name', this.value)" placeholder="Nombre del plato" style="font-weight: 700;">
                <input type="text" class="admin-input" value="${product.image || ''}" onchange="updateProductImage(${index}, this.value)" placeholder="Ruta de imagen (ej. ../assets/images/...)" style="font-size: 0.75rem; margin-top: 0.3rem; color: #555;">
            </td>
            <td>
                <select class="admin-input" onchange="updateProductField(${index}, 'category', this.value)">
                    ${catOptions}
                </select>
            </td>
            <td>
                <input type="number" class="admin-input" value="${priceVal}" onchange="updateProductPrice(${index}, this.value)" placeholder="Consultar" min="0">
            </td>
            <td>
                <textarea class="admin-textarea" onchange="updateProductField(${index}, 'description', this.value)" placeholder="Descripción e ingredientes del plato...">${product.description}</textarea>
            </td>
            <td style="text-align: center;">
                <label class="switch">
                    <input type="checkbox" ${product.popular ? 'checked' : ''} onchange="updateProductField(${index}, 'popular', this.checked)">
                    <span class="slider"></span>
                </label>
            </td>
            <td style="text-align: center;">
                <label class="switch">
                    <input type="checkbox" ${product.available ? 'checked' : ''} onchange="updateProductField(${index}, 'available', this.checked)">
                    <span class="slider"></span>
                </label>
            </td>
            <td style="text-align: center;">
                <button type="button" class="btn-remove" onclick="deleteProductRow(${index})" aria-label="Eliminar fila" style="margin: 0 auto; color: var(--red-error);">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

// Actualizar campos individuales
window.updateProductField = function(index, field, value) {
    if (currentMenu[index]) {
        currentMenu[index][field] = value;
    }
};

window.updateProductPrice = function(index, value) {
    if (currentMenu[index]) {
        const val = value.trim();
        currentMenu[index].price = val === '' ? null : parseFloat(val);
    }
};

window.updateProductImage = function(index, value) {
    if (currentMenu[index]) {
        currentMenu[index].image = value.trim();
        const imgThumb = document.getElementById(`thumb-${index}`);
        if (imgThumb) {
            imgThumb.src = value.trim() || '../assets/images/logo.png';
        }
    }
};

// Eliminar fila
window.deleteProductRow = function(index) {
    const confirmDelete = confirm(`¿Estás seguro de que quieres eliminar "${currentMenu[index].name}" del catálogo?`);
    if (confirmDelete) {
        currentMenu.splice(index, 1);
        renderAdminTable();
        updateStats();
        generateExportCode();
    }
};

// Agregar nueva fila de producto
window.addNewProductRow = function() {
    const newId = 'producto-' + Date.now();
    currentMenu.push({
        id: newId,
        name: 'Plato Nuevo',
        category: 'Tacos',
        description: 'Escribe aquí la descripción de tu plato nuevo.',
        price: null,
        image: '',
        available: true,
        popular: false
    });
    
    renderAdminTable();
    
    // Hacer scroll hasta el fondo de la tabla para ver el nuevo registro
    setTimeout(() => {
        const lastRow = document.getElementById(`row-${currentMenu.length - 1}`);
        if (lastRow) {
            lastRow.scrollIntoView({ behavior: 'smooth' });
            lastRow.style.backgroundColor = 'var(--cream)';
            setTimeout(() => { lastRow.style.backgroundColor = ''; }, 2000);
        }
    }, 100);
    
    updateStats();
    generateExportCode();
};

// Guardar cambios locales
window.saveLocalMenuChanges = function() {
    localStorage.setItem('valetatemada_custom_menu', JSON.stringify(currentMenu));
    updateStats();
    generateExportCode();
    showToast("💾 ¡Cambios guardados localmente! Recuerda exportar tu archivo para hacerlo permanente.");
};

// Restablecer datos originales
window.resetLocalMenuData = function() {
    const confirmReset = confirm("¿Quieres eliminar todos los cambios guardados localmente y restablecer el menú del sitio al catálogo original?");
    if (confirmReset) {
        localStorage.removeItem('valetatemada_custom_menu');
        loadMenuData();
        renderAdminTable();
        updateStats();
        generateExportCode();
        showToast("Catálogo restablecido al original.");
    }
};

// Actualizar Estadísticas
function updateStats() {
    if (!statTotal || !statActive || !statPopular) return;
    
    statTotal.textContent = currentMenu.length;
    statActive.textContent = currentMenu.filter(p => p.available).length;
    statPopular.textContent = currentMenu.filter(p => p.popular).length;
}

// Generar Código JS para menu-data.js
function generateExportCode() {
    if (!menuCodeBlock) return;
    
    const formattedJson = JSON.stringify(currentMenu, null, 2);
    const fullJsCode = `// Datos del menú oficial para el Sistema de Pedidos - Barbacoa Tatemada El Vale
// Generado automáticamente desde el Panel Administrativo

const MENU_DATA = ${formattedJson};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MENU_DATA;
}
`;
    menuCodeBlock.textContent = fullJsCode;
}

// Descargar archivo menu-data.js
window.downloadMenuDataFile = function() {
    // Generar código actualizado justo antes de descargar
    generateExportCode();
    
    const code = menuCodeBlock.textContent;
    const blob = new Blob([code], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'menu-data.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast("📥 Descargando archivo menu-data.js...");
};

// Copiar código de menu-data.js al portapapeles
window.copyMenuDataCode = function(buttonEl) {
    generateExportCode();
    const code = menuCodeBlock.textContent;
    
    navigator.clipboard.writeText(code).then(() => {
        const originalText = buttonEl.textContent;
        buttonEl.textContent = "¡Copiado con éxito!";
        buttonEl.style.backgroundColor = "var(--green-success)";
        buttonEl.style.color = "var(--white)";
        
        setTimeout(() => {
            buttonEl.textContent = originalText;
            buttonEl.style.backgroundColor = "";
            buttonEl.style.color = "";
        }, 2000);
    }).catch(err => {
        console.error("No se pudo copiar el código: ", err);
    });
};

// Copiar código de Apps Script al portapapeles
window.copyAppsScriptCode = function(buttonEl) {
    const code = document.getElementById('code-block').innerText;
    
    navigator.clipboard.writeText(code).then(() => {
        const originalText = buttonEl.textContent;
        buttonEl.textContent = "¡Código Copiado!";
        buttonEl.style.backgroundColor = "var(--green-success)";
        
        setTimeout(() => {
            buttonEl.textContent = originalText;
            buttonEl.style.backgroundColor = "";
        }, 2000);
    }).catch(err => {
        console.error("No se pudo copiar el código de Apps Script: ", err);
    });
};

// Auxiliar: Mostrar alerta Toast
function showToast(message) {
    const toast = document.getElementById('alert-toast');
    if (!toast) return;
    
    const toastText = document.getElementById('alert-toast-text');
    if (toastText) {
        toastText.textContent = message;
    }
    
    toast.style.display = 'flex';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3500);
}

// Cargar configuración de datos bancarios
function loadBankDetails() {
    const bankName = localStorage.getItem('valetatemada_bank_name') || 'BBVA';
    const bankClabe = localStorage.getItem('valetatemada_bank_clabe') || '0123 4567 8901 2345 67';
    const bankHolder = localStorage.getItem('valetatemada_bank_holder') || 'Barbacoa Tatemada El Vale';
    const bankNotes = localStorage.getItem('valetatemada_bank_notes') || 'Por favor envía tu comprobante de pago por este medio.';

    const inputName = document.getElementById('bank_name');
    const inputClabe = document.getElementById('bank_clabe');
    const inputHolder = document.getElementById('bank_holder');
    const inputNotes = document.getElementById('bank_notes');

    if (inputName) inputName.value = bankName;
    if (inputClabe) inputClabe.value = bankClabe;
    if (inputHolder) inputHolder.value = bankHolder;
    if (inputNotes) inputNotes.value = bankNotes;
}

// Guardar configuración de datos bancarios
window.saveBankDetails = function() {
    const bankNameInput = document.getElementById('bank_name');
    const bankClabeInput = document.getElementById('bank_clabe');
    const bankHolderInput = document.getElementById('bank_holder');
    const bankNotesInput = document.getElementById('bank_notes');

    const bankName = bankNameInput ? bankNameInput.value.trim() : '';
    const bankClabe = bankClabeInput ? bankClabeInput.value.trim() : '';
    const bankHolder = bankHolderInput ? bankHolderInput.value.trim() : '';
    const bankNotes = bankNotesInput ? bankNotesInput.value.trim() : '';

    if (!bankName || !bankClabe || !bankHolder) {
        showToast('❌ Por favor, llena todos los campos obligatorios del banco.');
        return;
    }

    localStorage.setItem('valetatemada_bank_name', bankName);
    localStorage.setItem('valetatemada_bank_clabe', bankClabe);
    localStorage.setItem('valetatemada_bank_holder', bankHolder);
    localStorage.setItem('valetatemada_bank_notes', bankNotes);

    showToast('✅ ¡Datos bancarios guardados con éxito!');
};

// ==========================================
// FUNCIONES DE CONTROL DE ACCESO (LOGIN / LOGOUT)
// ==========================================

window.handleLogin = function(event) {
    event.preventDefault();
    const userEl = document.getElementById('username');
    const passEl = document.getElementById('password');
    const errorEl = document.getElementById('login-error');
    
    if (!userEl || !passEl) return;
    
    const username = userEl.value.trim();
    const password = passEl.value;
    
    // Credenciales requeridas: barbacoa / tatemada
    if (username === 'barbacoa' && password === 'tatemada') {
        if (errorEl) errorEl.style.display = 'none';
        localStorage.setItem('valetatemada_admin_logged_in', 'true');
        document.body.classList.add('admin-logged-in');
        
        // Mostrar saludo premium con toast
        showToast("🔓 ¡Acceso concedido! Bienvenido al panel.");
        
        // Limpiar formulario
        userEl.value = '';
        passEl.value = '';
    } else {
        if (errorEl) {
            errorEl.style.display = 'block';
            // Efecto de vibración/shake al contenedor de error
            errorEl.style.animation = 'none';
            errorEl.offsetHeight; /* trigger reflow */
            errorEl.style.animation = 'loginShake 0.4s ease';
        }
        showToast("❌ Credenciales incorrectas.");
    }
};

window.togglePasswordVisibility = function() {
    const passEl = document.getElementById('password');
    const toggleBtn = document.getElementById('toggle-password');
    if (!passEl) return;
    
    if (passEl.type === 'password') {
        passEl.type = 'text';
        if (toggleBtn) {
            toggleBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
            `;
        }
    } else {
        passEl.type = 'password';
        if (toggleBtn) {
            toggleBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                </svg>
            `;
        }
    }
};

window.handleLogout = function() {
    const confirmLogout = confirm("¿Estás seguro de que quieres cerrar la sesión de administración?");
    if (confirmLogout) {
        localStorage.removeItem('valetatemada_admin_logged_in');
        document.body.classList.remove('admin-logged-in');
        showToast("🔒 Sesión cerrada correctamente.");
    }
};

