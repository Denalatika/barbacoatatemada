// Lógica del Sistema de Pedidos - Barbacoa Tatemada El Vale

// Estado de la aplicación
let cart = [];
let selectedCategory = 'Todas';
let activeMenuData = []; // Catálogo activo (puede cargarse del original o de localStorage)

// Configuración de opciones de carne
const MEAT_OPTION_PRODUCTS = [
    'orden-barbacoa',
    'media-barbacoa',
    'tacos-sencillos',
    'tapatia',
    'taco-charreado',
    'chapala-especial',
    'charro',
    'mariachis',
    'burrito',
    'taco-fundido'
];
let currentAddingProductId = null;

// Elementos del DOM
const menuGrid = document.getElementById('menu-grid');
const categoriesContainer = document.getElementById('categories-container');
const cartItemsContainer = document.getElementById('cart-items');
const emptyCartMsg = document.getElementById('cart-empty');
const orderForm = document.getElementById('order-form');
const summaryContainer = document.getElementById('summary-container');
const summaryDetails = document.getElementById('summary-details');

// Elementos de paso activo
const stepItems = document.querySelectorAll('.step-item');

// Inicialización de la aplicación al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    // 0. Inicializar catálogo de productos activos (localStorage o original)
    initMenuData();
    
    // 1. Cargar el menú de categorías
    renderCategories();
    
    // 2. Cargar el menú inicial (Todos los productos)
    renderMenu();
    
    // 3. Cargar carrito guardado en localStorage
    loadCartFromLocalStorage();
    
    // 4. Configurar listeners de formulario e interactividad
    setupListeners();
    
    // 5. Cargar perfil de cliente local guardado de compras anteriores (Auto-rellenado)
    loadCustomerProfileLocal();

    // 6. Detectar si se solicitó agregar un producto desde la página Home
    const urlParams = new URLSearchParams(window.location.search);
    const addItemId = urlParams.get('add');
    if (addItemId) {
        setTimeout(() => {
            addToCart(addItemId);
            // Limpiar la URL para evitar que se vuelva a agregar al recargar
            window.history.replaceState({}, document.title, window.location.pathname);
        }, 100);
    }
});

// Inicializar catálogo desde base de datos de localStorage o fallback al oficial
function initMenuData() {
    const savedMenu = localStorage.getItem('valetatemada_custom_menu');
    if (savedMenu) {
        try {
            activeMenuData = JSON.parse(savedMenu);
            // Sincronizar catálogo guardado con el oficial por si se agregaron nuevos productos oficiales
            let updated = false;
            MENU_DATA.forEach(officialProd => {
                const exists = activeMenuData.some(p => p.id === officialProd.id);
                if (!exists) {
                    activeMenuData.push(officialProd);
                    updated = true;
                }
            });
            if (updated) {
                localStorage.setItem('valetatemada_custom_menu', JSON.stringify(activeMenuData));
            }
        } catch (e) {
            console.error("Error al parsear el catálogo personalizado:", e);
            activeMenuData = [...MENU_DATA];
        }
    } else {
        activeMenuData = [...MENU_DATA];
    }
}

// Configuración de listeners generales
function setupListeners() {
    // Listener para cambiar el tipo de entrega (Mostrar/Ocultar Dirección y Ubicación)
    const deliveryOptions = document.querySelectorAll('input[name="delivery_type"]');
    deliveryOptions.forEach(option => {
        option.addEventListener('change', (e) => {
            const addressField = document.getElementById('address-field');
            if (e.target.value === 'A domicilio') {
                addressField.classList.add('visible');
                document.getElementById('address').setAttribute('required', 'true');
            } else {
                addressField.classList.remove('visible');
                document.getElementById('address').removeAttribute('required');
            }
            updateOrderSummary();
            updateStepIndicator();
            renderCart(); // Actualizar carrito de inmediato para mostrar/ocultar cargo de envío y recalcular total
        });
    });

    // Listener para método de pago (Mostrar/Ocultar estado de transferencia)
    const paymentOptions = document.querySelectorAll('input[name="payment_method"]');
    paymentOptions.forEach(option => {
        option.addEventListener('change', (e) => {
            const transferField = document.getElementById('transfer-field');
            if (e.target.value === 'Transferencia') {
                transferField.classList.add('visible');
                document.querySelectorAll('input[name="transfer_status"]').forEach(input => {
                    input.setAttribute('required', 'true');
                });
            } else {
                transferField.classList.remove('visible');
                document.querySelectorAll('input[name="transfer_status"]').forEach(input => {
                    input.removeAttribute('required');
                    input.checked = false;
                });
            }
            updateOrderSummary();
            updateStepIndicator();
        });
    });

    // Escuchar cambios en otros inputs del formulario para actualizar resumen en tiempo real
    const formInputs = orderForm.querySelectorAll('input, textarea');
    formInputs.forEach(input => {
        input.addEventListener('input', () => {
            updateOrderSummary();
            updateStepIndicator();
        });
        input.addEventListener('change', () => {
            updateOrderSummary();
            updateStepIndicator();
        });
    });

    // Listener para envío de formulario
    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        sendOrderToWhatsApp();
    });

    // Modal de carrito móvil
    const btnMobileViewCart = document.getElementById('btn-mobile-view-cart');
    const mobileCartModal = document.getElementById('mobile-cart-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');

    if (btnMobileViewCart && mobileCartModal && btnCloseModal) {
        btnMobileViewCart.addEventListener('click', () => {
            mobileCartModal.classList.add('active');
            renderCartModalList();
        });

        btnCloseModal.addEventListener('click', () => {
            mobileCartModal.classList.remove('active');
        });

        // Cerrar al dar click fuera del modal
        mobileCartModal.addEventListener('click', (e) => {
            if (e.target === mobileCartModal) {
                mobileCartModal.classList.remove('active');
            }
        });
    }

    // Modal de selección de carne
    const meatModal = document.getElementById('meat-select-modal');
    const btnCloseMeatModal = document.getElementById('btn-close-meat-modal');
    const btnConfirmMeat = document.getElementById('btn-confirm-meat');
    
    if (meatModal && btnCloseMeatModal && btnConfirmMeat) {
        // Cerrar modal
        btnCloseMeatModal.addEventListener('click', () => {
            meatModal.classList.remove('active');
            currentAddingProductId = null;
        });
        
        // Cerrar al dar click fuera
        meatModal.addEventListener('click', (e) => {
            if (e.target === meatModal) {
                meatModal.classList.remove('active');
                currentAddingProductId = null;
            }
        });
        
        // Confirmar selección
        btnConfirmMeat.addEventListener('click', () => {
            const selectedRadio = document.querySelector('input[name="meat-selection"]:checked');
            if (selectedRadio && currentAddingProductId) {
                addMeatProductToCart(currentAddingProductId, selectedRadio.value);
            }
            meatModal.classList.remove('active');
            currentAddingProductId = null;
        });
    }

    // Máscara inteligente para fecha de nacimiento (DD/MM/AA) sin escribir diagonales
    const dobInput = document.getElementById('customer_dob');
    if (dobInput) {
        dobInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, ''); // Eliminar todo lo que no sea número
            if (value.length > 6) {
                value = value.substring(0, 6); // Limitar a 6 dígitos (DDMMAA)
            }
            
            let formatted = '';
            if (value.length > 0) {
                formatted += value.substring(0, 2);
            }
            if (value.length > 2) {
                formatted += '/' + value.substring(2, 4);
            }
            if (value.length > 4) {
                formatted += '/' + value.substring(4, 6);
            }
            
            e.target.value = formatted;
        });
    }
}

// 1. RENDERIZAR CATEGORÍAS
function renderCategories() {
    if (!categoriesContainer) return;
    
    // Obtener categorías únicas del catálogo activo
    const categories = ['Todas', ...new Set(activeMenuData.map(item => item.category))];
    
    categoriesContainer.innerHTML = '';
    categories.forEach(category => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `category-tab ${category === selectedCategory ? 'active' : ''}`;
        button.textContent = category;
        button.addEventListener('click', () => {
            selectedCategory = category;
            
            // Actualizar clase activa de las pestañas
            document.querySelectorAll('.category-tab').forEach(tab => tab.classList.remove('active'));
            button.classList.add('active');
            
            // Re-renderizar menú filtrado
            renderMenu();
        });
        categoriesContainer.appendChild(button);
    });
}

// 2. RENDERIZAR MENÚ DIGITAL
function renderMenu() {
    if (!menuGrid) return;
    
    menuGrid.innerHTML = '';
    
    // Filtrar productos
    const filteredProducts = selectedCategory === 'Todas' 
        ? activeMenuData 
        : activeMenuData.filter(item => item.category === selectedCategory);
        
    if (filteredProducts.length === 0) {
        menuGrid.innerHTML = '<p class="text-center">No hay productos disponibles en esta categoría.</p>';
        return;
    }
    
    filteredProducts.forEach(product => {
        if (!product.available) return; // Solo mostrar disponibles
        
        const card = document.createElement('div');
        card.className = `product-card ${product.popular ? 'popular' : ''}`;
        
        // Formatear precio
        const priceLabel = product.price !== null ? `$${product.price}` : 'Consultar precio';
        const priceClass = product.price !== null ? '' : 'null';
        
        // Comprobar si el producto ya está en el carrito para mostrar el control de cantidad o agregar
        const isMeatOptionProduct = MEAT_OPTION_PRODUCTS.includes(product.id);
        const quantityInCart = cart
            .filter(item => item.id === product.id || item.id.startsWith(product.id + '_'))
            .reduce((sum, item) => sum + item.quantity, 0);
        
        let actionHTML = '';
        if (isMeatOptionProduct) {
            const btnText = quantityInCart > 0 ? `Agregar otro (${quantityInCart})` : 'Agregar';
            actionHTML = `
                <button type="button" class="btn-add-cart" onclick="addToCart('${product.id}')">
                    ${btnText}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
            `;
        } else {
            const cartItem = cart.find(item => item.id === product.id);
            if (cartItem) {
                actionHTML = `
                    <div class="quantity-control">
                        <button type="button" class="btn-qty" onclick="decreaseQuantity('${product.id}')" aria-label="Disminuir cantidad">-</button>
                        <span class="qty-val">${cartItem.quantity}</span>
                        <button type="button" class="btn-qty" onclick="increaseQuantity('${product.id}')" aria-label="Aumentar cantidad">+</button>
                    </div>
                `;
            } else {
                actionHTML = `
                    <button type="button" class="btn-add-cart" onclick="addToCart('${product.id}')">
                        Agregar 
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                `;
            }
        }

        // Obtener imagen del catálogo (usar un placeholder genérico o de logo en caso de no existir)
        const imageUrl = product.image || '../assets/images/logo.png';
        
        card.innerHTML = `
            <div class="product-image-wrapper">
                <img src="${imageUrl}" alt="${product.name}" class="product-image" loading="lazy" onerror="this.src='../assets/images/logo.png'">
            </div>
            <div class="product-card-content">
                <div class="product-info">
                    <span class="product-category">${product.category}</span>
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                </div>
                <div class="product-actions">
                    <span class="product-price ${priceClass}">${priceLabel}</span>
                    ${actionHTML}
                </div>
            </div>
        `;
        
        menuGrid.appendChild(card);
    });
}

// 3. AGREGAR AL CARRITO
function addToCart(productId) {
    const product = activeMenuData.find(p => p.id === productId);
    if (!product) return;
    
    // Si es un producto con opción de carne, abrimos el modal
    if (MEAT_OPTION_PRODUCTS.includes(productId)) {
        openMeatSelectModal(productId);
        return;
    }
    
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            category: product.category,
            price: product.price,
            quantity: 1
        });
    }
    
    saveCartToLocalStorage();
    renderMenu();
    renderCart();
    showToast(`Se agregó "${product.name}" a tu pedido.`);
}

// NUEVA FUNCIÓN: Abrir modal de carne
function openMeatSelectModal(productId) {
    const product = activeMenuData.find(p => p.id === productId);
    if (!product) return;
    
    currentAddingProductId = productId;
    
    const productNameEl = document.getElementById('meat-select-product-name');
    if (productNameEl) {
        productNameEl.textContent = product.name;
    }
    
    // Resetear a Barbacoa seleccionado por defecto
    const defaultRadio = document.querySelector('input[name="meat-selection"][value="Barbacoa"]');
    if (defaultRadio) {
        defaultRadio.checked = true;
    }
    
    const modal = document.getElementById('meat-select-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

// NUEVA FUNCIÓN: Confirmar carne y agregar al carrito
function addMeatProductToCart(productId, selectedMeat) {
    const product = activeMenuData.find(p => p.id === productId);
    if (!product) return;
    
    const cartItemId = productId + '_' + selectedMeat;
    const existingItem = cart.find(item => item.id === cartItemId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: cartItemId,
            name: `${product.name} (${selectedMeat})`,
            category: product.category,
            price: product.price,
            quantity: 1
        });
    }
    
    saveCartToLocalStorage();
    renderMenu();
    renderCart();
    showToast(`Se agregó "${product.name} (${selectedMeat})" a tu pedido.`);
}

// 4. INCREMENTAR CANTIDAD EN EL CARRITO
function increaseQuantity(productId) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += 1;
        saveCartToLocalStorage();
        renderMenu();
        renderCart();
    }
}

// 5. DECREMENTAR CANTIDAD EN EL CARRITO
function decreaseQuantity(productId) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity -= 1;
        if (item.quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        saveCartToLocalStorage();
        renderMenu();
        renderCart();
    }
}

// 6. ELIMINAR DEL CARRITO
function removeFromCart(productId) {
    const item = cart.find(item => item.id === productId);
    const itemName = item ? item.name : '';
    
    cart = cart.filter(item => item.id !== productId);
    saveCartToLocalStorage();
    renderMenu();
    renderCart();
    
    if (itemName) {
        showToast(`Se quitó "${itemName}" de tu pedido.`);
    }
}

// OBTENER SUBTOTAL DEL PEDIDO (sin envío)
function getCartSubtotalText() {
    let total = 0;
    let hasNull = false;
    cart.forEach(item => {
        if (item.price !== null) {
            total += item.price * item.quantity;
        } else {
            hasNull = true;
        }
    });
    if (hasNull) {
        return `$${total} (monto parcial)`;
    }
    return `$${total}`;
}

// OBTENER TOTAL DEL PEDIDO FORMATEADO (incluyendo envío si aplica)
function getCartTotalText() {
    let total = 0;
    let hasNull = false;
    cart.forEach(item => {
        if (item.price !== null) {
            total += item.price * item.quantity;
        } else {
            hasNull = true;
        }
    });
    
    // Sumar costo de envío ($60) si es a domicilio
    const deliveryTypeInput = document.querySelector('input[name="delivery_type"]:checked');
    const isDelivery = deliveryTypeInput && deliveryTypeInput.value === 'A domicilio';
    
    if (isDelivery && total > 0) {
        total += 60;
    }
    
    if (hasNull) {
        return `$${total} (monto parcial, consultar precios)`;
    }
    return `$${total}`;
}

// 7. RENDERIZAR CARRITO
function renderCart() {
    // 1. Actualizar sección del Carrito de Escritorio
    if (!cartItemsContainer) return;
    
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        emptyCartMsg.style.display = 'block';
        cartItemsContainer.appendChild(emptyCartMsg);
    } else {
        emptyCartMsg.style.display = 'none';
        
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            
            const priceText = item.price !== null ? `$${item.price}` : 'Consultar p.';
            
            itemElement.innerHTML = `
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-category">${item.category}</div>
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-control">
                        <button type="button" class="btn-qty" onclick="decreaseQuantity('${item.id}')" aria-label="Restar uno">-</button>
                        <span class="qty-val">${item.quantity}</span>
                        <button type="button" class="btn-qty" onclick="increaseQuantity('${item.id}')" aria-label="Sumar uno">+</button>
                    </div>
                    <button type="button" class="btn-remove" onclick="removeFromCart('${item.id}')" aria-label="Eliminar producto">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
        });

        // Sumar costo de envío ($60) si es a domicilio
        const deliveryTypeInput = document.querySelector('input[name="delivery_type"]:checked');
        const isDelivery = deliveryTypeInput && deliveryTypeInput.value === 'A domicilio';

        if (isDelivery) {
            // Fila de subtotal
            const subtotalElement = document.createElement('div');
            subtotalElement.className = 'cart-subtotal-row';
            subtotalElement.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding-top: 0.8rem; margin-top: 0.5rem; border-top: 2px solid var(--cream); font-size: 0.95rem; color: rgba(31, 18, 11, 0.7);';
            subtotalElement.innerHTML = `
                <span>Subtotal:</span>
                <span>${getCartSubtotalText()}</span>
            `;
            cartItemsContainer.appendChild(subtotalElement);

            // Fila de envío
            const deliveryElement = document.createElement('div');
            deliveryElement.className = 'cart-delivery-row';
            deliveryElement.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding-top: 0.4rem; font-size: 0.95rem; color: rgba(31, 18, 11, 0.7);';
            deliveryElement.innerHTML = `
                <span>Servicio a domicilio:</span>
                <span>$60</span>
            `;
            cartItemsContainer.appendChild(deliveryElement);
        }

        // Agregar fila del total en el carrito de escritorio
        const totalElement = document.createElement('div');
        totalElement.className = 'cart-total-row';
        totalElement.style.cssText = `display: flex; justify-content: space-between; align-items: center; padding-top: 0.6rem; margin-top: 0.4rem; ${isDelivery ? '' : 'border-top: 2px solid var(--cream);'} font-weight: 700; font-size: 1.1rem; color: var(--dark-brown);`;
        totalElement.innerHTML = `
            <span>Total del Pedido:</span>
            <span style="color: var(--burnt-orange); font-size: 1.25rem;">${getCartTotalText()}</span>
        `;
        cartItemsContainer.appendChild(totalElement);
    }
    
    // 2. Actualizar barra flotante para móviles
    updateMobileCartBar();
    
    // 3. Actualizar la lista en el modal del carrito móvil si es que está abierto
    renderCartModalList();
    
    // 4. Actualizar resumen general del formulario
    updateOrderSummary();
    
    // 5. Actualizar el indicador de pasos activos
    updateStepIndicator();
}

// Renderizar la lista de productos en el modal móvil
function renderCartModalList() {
    const modalItemsContainer = document.getElementById('mobile-cart-modal-items');
    if (!modalItemsContainer) return;
    
    modalItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        modalItemsContainer.innerHTML = `
            <div class="cart-empty">
                <span class="cart-empty-icon">🛒</span>
                <p>Aún no has agregado productos a tu pedido.</p>
            </div>
        `;
        // Cerrar modal automáticamente si se vacía
        const mobileCartModal = document.getElementById('mobile-cart-modal');
        if (mobileCartModal && mobileCartModal.classList.contains('active')) {
            setTimeout(() => {
                mobileCartModal.classList.remove('active');
            }, 1000);
        }
    } else {
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            
            itemElement.innerHTML = `
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-category">${item.category}</div>
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-control">
                        <button type="button" class="btn-qty" onclick="decreaseQuantity('${item.id}')" aria-label="Restar uno">-</button>
                        <span class="qty-val">${item.quantity}</span>
                        <button type="button" class="btn-qty" onclick="increaseQuantity('${item.id}')" aria-label="Sumar uno">+</button>
                    </div>
                    <button type="button" class="btn-remove" onclick="removeFromCart('${item.id}')" aria-label="Eliminar producto">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                </div>
            `;
            modalItemsContainer.appendChild(itemElement);
        });

        // Sumar costo de envío ($60) si es a domicilio
        const deliveryTypeInput = document.querySelector('input[name="delivery_type"]:checked');
        const isDelivery = deliveryTypeInput && deliveryTypeInput.value === 'A domicilio';

        if (isDelivery) {
            // Fila de subtotal
            const subtotalElement = document.createElement('div');
            subtotalElement.className = 'cart-subtotal-row';
            subtotalElement.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding-top: 0.8rem; margin-top: 0.5rem; border-top: 2px solid var(--cream); font-size: 0.95rem; color: rgba(31, 18, 11, 0.7);';
            subtotalElement.innerHTML = `
                <span>Subtotal:</span>
                <span>${getCartSubtotalText()}</span>
            `;
            modalItemsContainer.appendChild(subtotalElement);

            // Fila de envío
            const deliveryElement = document.createElement('div');
            deliveryElement.className = 'cart-delivery-row';
            deliveryElement.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding-top: 0.4rem; font-size: 0.95rem; color: rgba(31, 18, 11, 0.7);';
            deliveryElement.innerHTML = `
                <span>Servicio a domicilio:</span>
                <span>$60</span>
            `;
            modalItemsContainer.appendChild(deliveryElement);
        }

        // Agregar fila del total en el carrito móvil
        const totalElement = document.createElement('div');
        totalElement.className = 'cart-total-row';
        totalElement.style.cssText = `display: flex; justify-content: space-between; align-items: center; padding-top: 0.6rem; margin-top: 0.4rem; ${isDelivery ? '' : 'border-top: 2px solid var(--cream);'} font-weight: 700; font-size: 1.1rem; color: var(--dark-brown);`;
        totalElement.innerHTML = `
            <span>Total del Pedido:</span>
            <span style="color: var(--burnt-orange); font-size: 1.25rem;">${getCartTotalText()}</span>
        `;
        modalItemsContainer.appendChild(totalElement);
    }
}

// Actualizar barra flotante para móviles
function updateMobileCartBar() {
    const mobileCartBar = document.getElementById('mobile-cart-bar');
    const mobileCartCount = document.getElementById('mobile-cart-count');
    
    if (!mobileCartBar) return;
    
    if (cart.length === 0) {
        mobileCartBar.style.display = 'none';
    } else {
        mobileCartBar.style.display = 'flex';
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (mobileCartCount) {
            mobileCartCount.textContent = `${totalItems} ${totalItems === 1 ? 'producto' : 'productos'} en total`;
        }
    }
}

// 8. VALIDAR FORMULARIO DE PEDIDO
function validateOrderForm() {
    // Reglas de validación:
    // - Debe haber al menos un producto en el carrito.
    // - Nombre requerido.
    // - Teléfono requerido.
    // - Tipo de entrega seleccionado (Para recoger / A domicilio).
    // - Si es A domicilio, la dirección debe ser obligatoria.
    // - Debe seleccionar método de pago.
    // - Si selecciona transferencia, debe elegir si ya transfirió o si va a transferir.
    
    if (cart.length === 0) {
        showToast('Agrega al menos un producto antes de enviar tu pedido.');
        return false;
    }
    
    const name = document.getElementById('customer_name').value.trim();
    if (!name) {
        showToast('Por favor escribe tu nombre.');
        document.getElementById('customer_name').focus();
        return false;
    }
    
    const phone = document.getElementById('customer_phone').value.trim();
    if (!phone) {
        showToast('Por favor escribe tu teléfono.');
        document.getElementById('customer_phone').focus();
        return false;
    }
    
    const deliveryTypeInput = document.querySelector('input[name="delivery_type"]:checked');
    if (!deliveryTypeInput) {
        showToast('Selecciona si tu pedido es para recoger o a domicilio.');
        return false;
    }
    
    const deliveryType = deliveryTypeInput.value;
    if (deliveryType === 'A domicilio') {
        const address = document.getElementById('address').value.trim();
        if (!address) {
            showToast('Para pedidos a domicilio necesitamos tu dirección.');
            document.getElementById('address').focus();
            return false;
        }
    }
    
    const paymentMethodInput = document.querySelector('input[name="payment_method"]:checked');
    if (!paymentMethodInput) {
        showToast('Selecciona tu método de pago.');
        return false;
    }
    
    const paymentMethod = paymentMethodInput.value;
    if (paymentMethod === 'Transferencia') {
        const transferStatusInput = document.querySelector('input[name="transfer_status"]:checked');
        if (!transferStatusInput) {
            showToast('Por favor selecciona el estado de tu transferencia.');
            return false;
        }
    }
    
    return true;
}

// 9. CONSTRUIR MENSAJE PARA WHATSAPP
function buildWhatsAppMessage() {
    const name = document.getElementById('customer_name').value.trim();
    const phone = document.getElementById('customer_phone').value.trim();
    const dob = document.getElementById('customer_dob').value.trim() || 'No proporcionada';
    const deliveryType = document.querySelector('input[name="delivery_type"]:checked').value;
    const address = deliveryType === 'A domicilio' ? document.getElementById('address').value.trim() : 'N/A (Para recoger)';
    const paymentMethod = document.querySelector('input[name="payment_method"]:checked').value;
    
    let transferStatus = 'N/A';
    if (paymentMethod === 'Transferencia') {
        transferStatus = document.querySelector('input[name="transfer_status"]:checked').value;
    }
    
    const notes = document.getElementById('notes').value.trim() || 'Sin notas adicionales';
    
    // Formatear items del carrito
    let orderItemsText = '';
    cart.forEach(item => {
        orderItemsText += `- ${item.quantity} x ${item.name}\n`;
    });
    
    // Plantilla de mensaje
    const messageTemplate = `Hola, quiero hacer un pedido en Barbacoa Tatemada El Vale.
 
DATOS DEL CLIENTE:
Nombre: ${name}
Teléfono: ${phone}
Fecha de Nacimiento: ${dob} (para futuras promociones)
Tipo de pedido: ${deliveryType}
Dirección: ${address}
Método de pago: ${paymentMethod}
Estado de transferencia: ${transferStatus}

PEDIDO:
${orderItemsText}
TOTAL DEL PEDIDO: ${getCartTotalText()}
${deliveryType === 'A domicilio' ? 'Costo de envío: $60 (ya sumado al total)\n' : ''}
NOTAS:
${notes}

Favor de confirmarme disponibilidad y tiempo estimado. Gracias.`;

    return messageTemplate;
}

// 10. ENVIAR PEDIDO POR WHATSAPP
function sendOrderToWhatsApp() {
    if (!validateOrderForm()) return;
    
    // Llamar a placeholder de base de datos futura antes de continuar
    saveCustomerForFutureDatabase();
    
    const message = buildWhatsAppMessage();
    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = "526311052305";
    const waUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    // Mostrar confirmación
    const confirmSend = confirm('¿Todo listo? Te redirigiremos a WhatsApp para enviar el pedido redactado.');
    if (confirmSend) {
        // Guardar el perfil de contacto del cliente para futuros pedidos (Autocompletado)
        saveCustomerProfileLocal();
        
        // Limpiar el carrito de compras para que al volver de WhatsApp la página esté vacía
        clearCart();
        
        // Abrir WhatsApp de forma robusta e inmune a bloqueadores de ventanas emergentes
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile) {
            // En móvil, la redirección directa es óptima para abrir la app nativa de WhatsApp
            window.location.href = waUrl;
        } else {
            // En escritorio, intentamos abrir en pestaña nueva para conservar la pestaña de compra
            const waWindow = window.open(waUrl, '_blank');
            if (!waWindow || waWindow.closed || typeof waWindow.closed === 'undefined') {
                // Si el bloqueador de ventanas emergentes de escritorio lo detiene, redirigimos la pestaña actual
                window.location.href = waUrl;
            }
        }
    }
}

// 11. GUARDAR EN LOCAL STORAGE
function saveCartToLocalStorage() {
    localStorage.setItem('valetatemada_cart', JSON.stringify(cart));
}

// 12. CARGAR DESDE LOCAL STORAGE
function loadCartFromLocalStorage() {
    const savedCart = localStorage.getItem('valetatemada_cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
            renderCart();
        } catch (e) {
            console.error("Error al leer el carrito guardado:", e);
            cart = [];
        }
    }
}

// 13. LIMPIAR EL CARRITO
function clearCart() {
    cart = [];
    saveCartToLocalStorage();
    renderMenu();
    renderCart();
    
    // Cerrar modal si estuviera abierto
    const mobileCartModal = document.getElementById('mobile-cart-modal');
    if (mobileCartModal) {
        mobileCartModal.classList.remove('active');
    }
    
    showToast('El pedido actual ha sido limpiado.');
}

// FUNCIÓN AUXILIAR: Actualizar resumen en tiempo real e indicador de pasos
function updateOrderSummary() {
    if (!summaryContainer || !summaryDetails) return;
    
    if (cart.length === 0) {
        summaryContainer.style.display = 'none';
        return;
    }
    
    summaryContainer.style.display = 'block';
    
    const name = document.getElementById('customer_name').value.trim() || '<i>No ingresado</i>';
    const phone = document.getElementById('customer_phone').value.trim() || '<i>No ingresado</i>';
    
    const dobInput = document.getElementById('customer_dob');
    const dob = dobInput ? dobInput.value.trim() : '';
    
    const deliveryTypeInput = document.querySelector('input[name="delivery_type"]:checked');
    const deliveryType = deliveryTypeInput ? deliveryTypeInput.value : '<i>No seleccionado</i>';
    
    const paymentMethodInput = document.querySelector('input[name="payment_method"]:checked');
    const paymentMethod = paymentMethodInput ? paymentMethodInput.value : '<i>No seleccionado</i>';
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    summaryDetails.innerHTML = `
        <div class="summary-row">
            <span class="summary-label">Artículos:</span>
            <span class="summary-val">${totalItems} u.</span>
        </div>
        <div class="summary-row">
            <span class="summary-label">Cliente:</span>
            <span class="summary-val">${name}</span>
        </div>
        <div class="summary-row">
            <span class="summary-label">Teléfono:</span>
            <span class="summary-val">${phone}</span>
        </div>
        ${dob ? `
        <div class="summary-row">
            <span class="summary-label">F. de Nacimiento:</span>
            <span class="summary-val">${dob}</span>
        </div>
        ` : ''}
        <div class="summary-row">
            <span class="summary-label">Entrega:</span>
            <span class="summary-val">${deliveryType}</span>
        </div>
        <div class="summary-row">
            <span class="summary-label">Forma de pago:</span>
            <span class="summary-val">${paymentMethod}</span>
        </div>
        ${paymentMethod === 'Transferencia' ? `
        <div class="summary-row" style="animation: fadeIn 0.3s ease;">
            <span class="summary-label">Estado transf.:</span>
            <span class="summary-val" style="color: ${document.querySelector('input[name="transfer_status"]:checked') ? '#2e7d32' : 'var(--burnt-orange)'}; font-weight: 600;">
                ${document.querySelector('input[name="transfer_status"]:checked') ? document.querySelector('input[name="transfer_status"]:checked').value : '<i>No seleccionado</i>'}
            </span>
        </div>
        ` : ''}
        ${deliveryType === 'A domicilio' ? `
        <div class="summary-row" style="animation: fadeIn 0.3s ease; font-size: 0.95rem; color: rgba(31, 18, 11, 0.75);">
            <span class="summary-label">Costo de envío:</span>
            <span class="summary-val">$60</span>
        </div>
        ` : ''}
        <div class="summary-row total-row" style="margin-top: 0.8rem; padding-top: 0.8rem; border-top: 1px dashed rgba(31, 18, 11, 0.15); font-weight: 700; font-size: 1.15rem; color: var(--dark-brown); display: flex; justify-content: space-between; align-items: center;">
            <span class="summary-label">Total del Pedido:</span>
            <span class="summary-val" style="color: var(--burnt-orange); font-size: 1.25rem;">${getCartTotalText()}</span>
        </div>
    `;
    
    // Actualizar caja de información de transferencia si existe
    const transferInfoBox = document.getElementById('transfer-info-box');
    if (transferInfoBox) {
        const bankName = localStorage.getItem('valetatemada_bank_name') || 'BBVA';
        const bankClabe = localStorage.getItem('valetatemada_bank_clabe') || '0123 4567 8901 2345 67';
        const bankHolder = localStorage.getItem('valetatemada_bank_holder') || 'Barbacoa Tatemada El Vale';
        const bankNotes = localStorage.getItem('valetatemada_bank_notes') || 'Por favor envía tu comprobante de pago por este medio.';
        
        transferInfoBox.innerHTML = `
            <p style="margin-bottom: 0.6rem; font-weight: 600; color: var(--dark-brown);">Realiza tu transferencia a los siguientes datos:</p>
            <div style="background-color: rgba(255, 255, 255, 0.6); padding: 0.8rem; border-radius: var(--radius-sm); margin-bottom: 0.8rem; text-align: left; font-size: 0.85rem; border: 1px solid rgba(184, 92, 44, 0.15);">
                <div style="margin-bottom: 0.3rem;"><strong>Banco:</strong> ${bankName}</div>
                <div style="margin-bottom: 0.3rem;"><strong>CLABE:</strong> <span class="bank-clabe-val">${bankClabe}</span></div>
                <div style="margin-bottom: 0.3rem;"><strong>Titular:</strong> ${bankHolder}</div>
                ${bankNotes ? `<div style="font-style: italic; color: #666; margin-top: 0.3rem; border-top: 1px solid rgba(0,0,0,0.05); padding-top: 0.3rem;">${bankNotes}</div>` : ''}
            </div>
            <div style="font-weight: 600; color: var(--dark-brown); text-align: center;">Monto exacto a transferir:</div>
            <div class="transfer-total-amount" style="display: block; text-align: center; margin: 0.3rem auto 0 auto; width: fit-content;">${getCartTotalText()}</div>
        `;
    }
}

// FUNCIÓN AUXILIAR: Actualizar pasos de forma visual (indicador de progreso)
function updateStepIndicator() {
    if (stepItems.length === 0) return;
    
    // Paso 1: Elegir productos (Siempre activo si el carrito está vacío o tiene algo)
    const step1 = stepItems[0];
    const step2 = stepItems[1];
    const step3 = stepItems[2];
    
    step1.classList.add('active');
    
    // Paso 2: Llenar datos (Se activa cuando hay al menos 1 producto en el carrito)
    if (cart.length > 0) {
        step2.classList.add('active');
    } else {
        step2.classList.remove('active');
        step3.classList.remove('active');
        return;
    }
    
    // Paso 3: Enviar por WhatsApp (Se activa cuando los campos obligatorios están listos)
    const name = document.getElementById('customer_name').value.trim();
    const phone = document.getElementById('customer_phone').value.trim();
    const deliveryTypeInput = document.querySelector('input[name="delivery_type"]:checked');
    const paymentMethodInput = document.querySelector('input[name="payment_method"]:checked');
    
    let isStep2Complete = name && phone && deliveryTypeInput && paymentMethodInput;
    
    if (isStep2Complete) {
        // Validación adicional si es a domicilio
        if (deliveryTypeInput.value === 'A domicilio') {
            const address = document.getElementById('address').value.trim();
            if (!address) isStep2Complete = false;
        }
        // Validación adicional si es transferencia
        if (paymentMethodInput.value === 'Transferencia') {
            const transferStatusInput = document.querySelector('input[name="transfer_status"]:checked');
            if (!transferStatusInput) isStep2Complete = false;
        }
    }
    
    if (isStep2Complete) {
        step3.classList.add('active');
    } else {
        step3.classList.remove('active');
    }
}

// FUNCIÓN AUXILIAR: Mostrar Alerta flotante amigable (Toast)
function showToast(message) {
    const toast = document.getElementById('alert-toast');
    if (!toast) return;
    
    const toastText = document.getElementById('alert-toast-text');
    if (toastText) {
        toastText.textContent = message;
    }
    
    toast.style.display = 'flex';
    
    // Ocultar automáticamente después de 3.5 segundos
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3500);
}

// GOOGLE SHEETS INTEGRATION - CRM
/**
 * saveCustomerForFutureDatabase()
 * 
 * PROPÓSITO:
 * Envía la información capturada del pedido en segundo plano al Web App de Google Sheets
 * configurado por el administrador, garantizando un registro CRM 100% gratuito.
 */
function saveCustomerForFutureDatabase() {
    // 1. Intentar obtener la URL de localStorage (útil para pruebas locales o si el admin la edita en su navegador)
    let sheetsUrl = localStorage.getItem('valetatemada_sheets_url');
    
    // 2. ENLACE DE PRODUCCIÓN POR DEFECTO:
    // Al desplegar tu sitio en Vercel, tus clientes no tienen tu URL de Sheets en su localStorage.
    // Para que los pedidos de TODOS tus clientes se guarden en tu Google Sheets, coloca aquí tu URL de Apps Script:
    const DEFAULT_SHEETS_URL = "https://script.google.com/macros/s/AKfycbz2d8k0BU0CFnd4wO_ZA-FbaXPrhB4y57XQ3Tu_8A1RBlFXCU-j77u9YZNXFVncMQWs/exec"; 
    
    if (!sheetsUrl || sheetsUrl === "null" || sheetsUrl.trim() === "") {
        sheetsUrl = DEFAULT_SHEETS_URL;
    }
    
    // Si sigue siendo el placeholder o está vacío, saltamos la sincronización
    if (!sheetsUrl || sheetsUrl.includes("PLACEHOLDER") || sheetsUrl.trim() === "") {
        console.log("Conexión con Google Sheets no configurada en código ni en local. Saltando registro.");
        return;
    }
    
    try {
        const name = document.getElementById('customer_name').value.trim();
        const phone = document.getElementById('customer_phone').value.trim();
        const dob = document.getElementById('customer_dob').value.trim() || 'No proporcionada';
        const deliveryType = document.querySelector('input[name="delivery_type"]:checked').value;
        const address = deliveryType === 'A domicilio' ? document.getElementById('address').value.trim() : 'N/A (Para recoger)';
        const locationLink = 'No proporcionado';
        const paymentMethod = document.querySelector('input[name="payment_method"]:checked').value;
        
        let transferStatus = 'N/A';
        if (paymentMethod === 'Transferencia') {
            const selectedStatus = document.querySelector('input[name="transfer_status"]:checked');
            transferStatus = selectedStatus ? selectedStatus.value : 'No seleccionado';
        }
        
        const notes = document.getElementById('notes').value.trim() || 'Sin notas adicionales';
        
        // Formatear items del carrito de forma concisa para la celda de Excel
        let orderItemsText = '';
        cart.forEach(item => {
            orderItemsText += `- ${item.quantity} u. x ${item.name} ($${item.price !== null ? item.price : 'p.c'})\n`;
        });
        
        const orderPayload = {
            customer_name: name,
            customer_phone: phone,
            customer_dob: dob, // NUEVO CAMPO: Fecha de Nacimiento
            delivery_type: deliveryType,
            address: address,
            location_link: locationLink,
            payment_method: paymentMethod,
            transfer_status: transferStatus,
            order_total: getCartTotalText(), // NUEVO CAMPO: Total del pedido
            order_items: orderItemsText,
            notes: notes
        };
        
        console.log("Enviando pedido a Google Sheets...", orderPayload);
        
        // Envío asíncrono y silencioso en segundo plano sin interrumpir al cliente
        fetch(sheetsUrl, {
            method: 'POST',
            mode: 'cors', // Usar cors con un content-type simple evita OPTIONS preflight y maneja la redirección de forma nativa
            redirect: 'follow', // Muy importante para seguir el redirect 302 de Google Apps Script
            keepalive: true, // NUEVO: Evita que la petición sea abortada por el navegador al navegar/redirigir a WhatsApp
            headers: {
                'Content-Type': 'text/plain;charset=utf-8' // Content-type simple para no disparar preflight OPTIONS que Google bloquea
            },
            body: JSON.stringify(orderPayload)
        })
        .then(response => {
            console.log("Petición enviada. Estado de respuesta de red:", response.status);
        })
        .catch(err => {
            // Nota: Si ocurre un bloqueo CORS al final de la redirección, la petición POST original
            // ya fue recibida y ejecutada con éxito en Google Sheets.
            console.log("Sincronización finalizada de fondo.");
        });
    } catch (error) {
        console.error("Excepción en saveCustomerForFutureDatabase:", error);
    }
}

// ==========================================
// AUTOCOMPLETADO Y RETENCIÓN DE CLIENTES (CRM LOCAL)
// ==========================================

/**
 * Guarda los datos de contacto y preferencias de entrega/pago en localStorage.
 * Esto evita duplicar la captura manual de datos en visitas futuras.
 */
function saveCustomerProfileLocal() {
    try {
        const name = document.getElementById('customer_name').value.trim();
        const phone = document.getElementById('customer_phone').value.trim();
        const dob = document.getElementById('customer_dob').value.trim();
        
        const deliveryTypeInput = document.querySelector('input[name="delivery_type"]:checked');
        const deliveryType = deliveryTypeInput ? deliveryTypeInput.value : '';
        
        const address = document.getElementById('address').value.trim();
        
        const paymentMethodInput = document.querySelector('input[name="payment_method"]:checked');
        const paymentMethod = paymentMethodInput ? paymentMethodInput.value : '';
        
        const profile = {
            name: name,
            phone: phone,
            dob: dob, // Guardar fecha de nacimiento
            delivery_type: deliveryType,
            address: address,
            payment_method: paymentMethod,
            last_updated: new Date().toISOString()
        };
        
        localStorage.setItem('valetatemada_customer_profile', JSON.stringify(profile));
        console.log("Perfil del cliente guardado localmente con éxito para autocompletado.");
    } catch (e) {
        console.error("Error al guardar el perfil local del cliente:", e);
    }
}

/**
 * Carga el perfil del cliente desde localStorage y autocompleta el formulario.
 * Ejecuta eventos change para abrir secciones condicionales (ej. campo dirección o transferencia).
 */
function loadCustomerProfileLocal() {
    const savedProfile = localStorage.getItem('valetatemada_customer_profile');
    if (!savedProfile) return;
    
    try {
        const profile = JSON.parse(savedProfile);
        
        // Auto-rellenar campos de texto
        if (profile.name) document.getElementById('customer_name').value = profile.name;
        if (profile.phone) document.getElementById('customer_phone').value = profile.phone;
        if (profile.dob) document.getElementById('customer_dob').value = profile.dob;
        if (profile.address) document.getElementById('address').value = profile.address;
        
        // Auto-seleccionar Tipo de Entrega
        if (profile.delivery_type) {
            const deliveryRadio = document.querySelector(`input[name="delivery_type"][value="${profile.delivery_type}"]`);
            if (deliveryRadio) {
                deliveryRadio.checked = true;
                // Disparar evento de cambio para expandir campos ocultos con suavidad
                deliveryRadio.dispatchEvent(new Event('change'));
            }
        }
        
        // Auto-seleccionar Método de Pago
        if (profile.payment_method) {
            const paymentRadio = document.querySelector(`input[name="payment_method"][value="${profile.payment_method}"]`);
            if (paymentRadio) {
                paymentRadio.checked = true;
                // Disparar evento de cambio
                paymentRadio.dispatchEvent(new Event('change'));
            }
        }
        
        // Mostrar saludo e indicador Toast de bienvenida amigable
        if (profile.name) {
            setTimeout(() => {
                showToast(`¡Bienvenido de vuelta, ${profile.name}! Autocompletamos tus datos para agilizar tu pedido. 🌮`);
            }, 800);
        }
        
    } catch (e) {
        console.error("Error al cargar perfil guardado del cliente:", e);
    }
}
