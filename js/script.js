document.addEventListener('DOMContentLoaded', () => {
    // --- Modern Mobile Menu Navigation ---
    const mobileMenuBtn = document.getElementById('mobile-menu-toggle') || document.querySelector('.mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu') || document.querySelector('.nav-menu');
    const navBackdrop = document.getElementById('nav-backdrop');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileCtas = document.querySelectorAll('.mobile-order-cta, .mobile-wa-cta');

    const openMenu = () => {
        if (!navMenu) return;
        navMenu.classList.add('active');
        if (mobileMenuBtn) {
            mobileMenuBtn.classList.add('is-active');
            mobileMenuBtn.setAttribute('aria-expanded', 'true');
        }
        if (navBackdrop) navBackdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeMenu = () => {
        if (!navMenu) return;
        navMenu.classList.remove('active');
        if (mobileMenuBtn) {
            mobileMenuBtn.classList.remove('is-active');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
        }
        if (navBackdrop) navBackdrop.classList.remove('active');
        document.body.style.overflow = '';
    };

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            const isOpen = navMenu && navMenu.classList.contains('active');
            if (isOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        });
    }

    if (navBackdrop) {
        navBackdrop.addEventListener('click', closeMenu);
    }

    // Close menu when clicking links or CTAs inside drawer
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeMenu();
        });
    });

    mobileCtas.forEach(cta => {
        cta.addEventListener('click', () => {
            closeMenu();
        });
    });

    // Smooth Scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '') {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                return;
            }

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const headerOffset = window.innerWidth <= 768 ? 72 : 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Header scroll shadow effect
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            header.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)';
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
    };

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        });
    }

    // Close modal when clicking outside the image
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
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

    // Esc key to close modal and mobile menu
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (navMenu && navMenu.classList.contains('active')) {
                closeMenu();
            }
            if (modal && modal.style.display === 'block') {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
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

    // Scroll-spy active link indicator
    const trackedSections = [
        { id: '#platillos', link: document.querySelector('.nav-link[href="#platillos"]') },
        { id: '#historia', link: document.querySelector('.nav-link[href="#historia"]') },
        { id: '#galeria', link: document.querySelector('.nav-link[href="#galeria"]') },
        { id: '#ubicacion', link: document.querySelector('.nav-link[href="#ubicacion"]') }
    ];
    const homeLink = document.querySelector('.nav-link[href="#"]');

    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;
        let activeFound = false;

        if (scrollY < 200) {
            navLinks.forEach(l => l.classList.remove('active'));
            if (homeLink) homeLink.classList.add('active');
            return;
        }

        for (let i = trackedSections.length - 1; i >= 0; i--) {
            const item = trackedSections[i];
            const section = document.querySelector(item.id);
            if (section && (section.offsetTop - 150) <= scrollY) {
                navLinks.forEach(l => l.classList.remove('active'));
                if (item.link) item.link.classList.add('active');
                activeFound = true;
                break;
            }
        }

        if (!activeFound && homeLink) {
            navLinks.forEach(l => l.classList.remove('active'));
            homeLink.classList.add('active');
        }
    });
});
