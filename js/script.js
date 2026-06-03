document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    mobileMenuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const isExpanded = navMenu.classList.contains('active');
        mobileMenuBtn.setAttribute('aria-expanded', isExpanded);
    });

    // Close mobile menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            mobileMenuBtn.setAttribute('aria-expanded', false);
        });
    });

    // Smooth Scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Header scroll effect
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        } else {
            header.style.boxShadow = '0 2px 8px rgba(31, 18, 11, 0.08)';
        }
    });

    // Modal functionality for Gallery
    const modal = document.getElementById('galleryModal');
    const modalImg = document.getElementById('modalImage');
    const closeModal = document.querySelector('.close-modal');

    // Make openModal function global so onclick in HTML can use it
    window.openModal = function (imageSrc) {
        modal.style.display = 'block';
        modalImg.src = imageSrc;
        document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    }

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    // Close modal when clicking outside the image
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Spotlight effect for cards
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

    // Esc key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    // Update Current Year
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Advanced Spotlight Sync Pointer (Global cursor tracking)
    const syncPointer = ({ x, y }) => {
        document.documentElement.style.setProperty('--x', x.toFixed(2));
        document.documentElement.style.setProperty('--xp', (x / window.innerWidth).toFixed(2));
        document.documentElement.style.setProperty('--y', y.toFixed(2));
        document.documentElement.style.setProperty('--yp', (y / window.innerHeight).toFixed(2));
    };
    document.body.addEventListener('pointermove', syncPointer);

    // Story Image Slideshow
    const storyImg1 = document.getElementById('story-img-1');
    const storyImg2 = document.getElementById('story-img-2');
    if (storyImg1 && storyImg2) {
        setInterval(() => {
            if (storyImg1.style.opacity === '1') {
                storyImg1.style.opacity = '0';
                storyImg2.style.opacity = '1';
            } else {
                storyImg1.style.opacity = '1';
                storyImg2.style.opacity = '0';
            }
        }, 4000); // Cambia cada 4 segundos
    }
});

    // --- Interactive Mobile Menu Logic ---
    const mobileMenuItems = document.querySelectorAll('#mobile-dock .menu__item');
    
    const setMenuLineWidth = (activeItem) => {
        const textElement = activeItem.querySelector('.menu__text');
        if (textElement) {
            const textWidth = textElement.offsetWidth;
            activeItem.style.setProperty('--lineWidth', `${textWidth}px`);
        }
    };

    const handleMenuClick = (e) => {
        const item = e.currentTarget;
        const targetId = item.getAttribute('data-target');

        // Update active state
        mobileMenuItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        setMenuLineWidth(item);

        // Handle navigation
        if (targetId === 'whatsapp') {
            window.location.href = '/sistema-pedidos/';
        } else if (targetId === 'body') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 20; // Less offset for mobile dock
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
        }
    };

    mobileMenuItems.forEach(item => {
        item.addEventListener('click', handleMenuClick);
    });

    // Initialize first item line width
    const firstActive = document.querySelector('#mobile-dock .menu__item.active');
    if (firstActive) {
        setTimeout(() => setMenuLineWidth(firstActive), 100);
    }

    // Update on resize
    window.addEventListener('resize', () => {
        const activeItem = document.querySelector('#mobile-dock .menu__item.active');
        if (activeItem) setMenuLineWidth(activeItem);
    });

    // Optional: Highlight menu item on scroll
    const sections = ['#platillos', '#galeria', '#ubicacion'];
    window.addEventListener('scroll', () => {
        if (window.innerWidth > 768) return;
        
        let current = 'body';
        sections.forEach(id => {
            const section = document.querySelector(id);
            if (section) {
                const sectionTop = section.offsetTop - 100;
                if (window.pageYOffset >= sectionTop) {
                    current = id;
                }
            }
        });

        mobileMenuItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-target') === current) {
                item.classList.add('active');
                setMenuLineWidth(item);
            }
        });
    });
