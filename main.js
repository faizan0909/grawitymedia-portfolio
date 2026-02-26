// Initialize Lenis for Smooth Scrolling - TUNED FOR RESPONSIVENESS
const lenis = new Lenis({
    duration: 0.8, // Reduced from 1.2 for faster response
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1.2, // Increased for more direct control
    smoothTouch: false,
    touchMultiplier: 2,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// Integrate GSAP with Lenis
gsap.registerPlugin(ScrollTrigger);

// Custom Cursor Logic
const cursor = document.querySelector('.cursor');
if (cursor) {
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Smooth cursor follow - Slightly faster
    function animateCursor() {
        cursorX += (mouseX - cursorX) * 0.2; // Increased interpolation speed
        cursorY += (mouseY - cursorY) * 0.2;

        cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    const interactiveElements = document.querySelectorAll('a, button, input, textarea, .project-card, .team-member');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('cursor-hover');
            cursor.style.width = '50px';
            cursor.style.height = '50px';
            cursor.style.backgroundColor = 'rgba(210, 31, 60, 0.2)';
            cursor.style.border = 'none';
        });

        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('cursor-hover');
            cursor.style.width = '20px';
            cursor.style.height = '20px';
            cursor.style.backgroundColor = 'transparent';
            cursor.style.border = '1px solid var(--accent-color)';
        });
    });
}

// GSAP Animations - CRISPER EASING
document.addEventListener('DOMContentLoaded', () => {

    // Hero Text Reveal
    const heroWords = document.querySelectorAll('.hero-title .word');

    // Set initial state via JS (prevents FOUC or invisible text if JS fails)
    gsap.set(heroWords, { y: '110%' });

    gsap.to(heroWords, {
        y: 0,
        duration: 1.0,
        stagger: 0.15,
        ease: 'power2.out',
        delay: 0.2
    });

    // Ensure all fade-in elements are visible to GSAP before animating
    // (In case CSS was overriding)
    // We animate FROM opacity 0 and y 30

    // Section Titles
    const titles = document.querySelectorAll('.section-title');
    titles.forEach(title => {
        gsap.fromTo(title,
            { y: 30, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.8,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: title,
                    start: 'top 85%',
                }
            }
        );
    });

    // Portfolio & Grid Stagger
    const grids = document.querySelectorAll('.portfolio-grid, .team-grid, .services-grid');
    grids.forEach(grid => {
        const children = grid.children;
        gsap.fromTo(children,
            { y: 40, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: grid,
                    start: 'top 85%'
                }
            }
        );
    });

    // Line Animation
    const lines = document.querySelectorAll('.line');
    lines.forEach(line => {
        gsap.fromTo(line,
            { width: 0 },
            {
                width: 60,
                duration: 0.8,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: line,
                    start: 'top 85%'
                }
            }
        );
    });

    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('open');
            menuToggle.classList.toggle('active');
        });
    }

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('open');
            menuToggle.classList.remove('active');
        });
    });

    // Initialize CMS
    if (typeof DriveCMS !== 'undefined') {
        new DriveCMS();
    }
});
