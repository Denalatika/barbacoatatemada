document.addEventListener('DOMContentLoaded', () => {
    const menuGrid = document.getElementById('menu-grid');
    if (!menuGrid) return;

    // 1. Cargar datos del menú (priorizar local storage si hay cambios del admin)
    let currentMenu = [];
    const savedMenu = localStorage.getItem('valetatemada_custom_menu');
    
    if (savedMenu) {
        try {
            currentMenu = JSON.parse(savedMenu);
            // Sincronizar catálogo guardado con el oficial por si se agregaron nuevos
            let updated = false;
            if (typeof MENU_DATA !== 'undefined') {
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
            }
        } catch (e) {
            console.error("Error al parsear menú guardado localmente:", e);
            currentMenu = typeof MENU_DATA !== 'undefined' ? [...MENU_DATA] : [];
        }
    } else {
        currentMenu = typeof MENU_DATA !== 'undefined' ? [...MENU_DATA] : [];
    }

    // 2. Filtrar solo los productos populares y disponibles para mostrar en el Home
    const popularItems = currentMenu.filter(item => item.popular && item.available);

    // 3. Renderizar las tarjetas
    let htmlContent = '';
    
    popularItems.forEach(item => {
        // Ajustar la ruta de la imagen porque en menu-data.js están relativas a /sistema-pedidos/
        // Si empieza con '../assets', lo cambiamos a 'assets'
        let imageUrl = item.image || 'assets/images/logo.png';
        if (imageUrl.startsWith('../')) {
            imageUrl = imageUrl.substring(3); // Quita el '../'
        }

        const priceText = item.price !== null ? `$${item.price}` : 'Consultar';

        htmlContent += `
            <div class="card" data-glow>
                <div class="card-img-wrapper">
                    <img src="${imageUrl}" alt="${item.name}" class="card-img" loading="lazy">
                </div>
                <div class="card-body">
                    <div class="card-header">
                        <h3 class="card-title">${item.name}</h3>
                        <span class="card-price">${priceText}</span>
                    </div>
                    <p class="card-text">${item.description}</p>
                    <a href="/sistema-pedidos/?add=${item.id}" class="btn btn-outline">Pedir ahora</a>
                </div>
            </div>
        `;
    });

    if (popularItems.length === 0) {
        htmlContent = '<p style="text-align:center; grid-column: 1/-1;">Próximamente más platillos deliciosos.</p>';
    }

    menuGrid.innerHTML = htmlContent;

    // 4. Re-inicializar el efecto Spotlight para las nuevas tarjetas (copiado de script.js)
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--x', `${x}px`);
            card.style.setProperty('--y', `${y}px`);
        });
    });

    // 5. Actualizar imágenes del Hero
    let heroImages = popularItems.filter(item => item.image).map(item => item.image);
    if (heroImages.length < 4) {
        const extraImages = currentMenu.filter(item => item.image && !item.popular).map(item => item.image);
        heroImages = heroImages.concat(extraImages);
    }
    
    for (let i = 0; i < 4; i++) {
        const heroImg = document.getElementById(`hero-img-${i+1}`);
        if (heroImg && heroImages[i]) {
            let imgUrl = heroImages[i];
            if (imgUrl.startsWith('../')) {
                imgUrl = imgUrl.substring(3);
            }
            heroImg.src = imgUrl;
        }
    }
});
