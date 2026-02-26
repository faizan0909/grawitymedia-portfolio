class DriveCMS {
    constructor() {
        this.categories = [];
        this.cache = {};
        this.currentCategory = null;
        this.init();
        this.initModal();
    }

    async init() {
        console.log('DriveCMS: Initializing...');
        this.renderLoadingState();

        try {
            await this.fetchPortfolioFromAPI();
            this.renderFilters();

            if (this.categories.length > 0) {
                this.selectCategory(this.categories[0].id);
            }
        } catch (error) {
            console.error('DriveCMS Error:', error);
            this.renderError('Failed to load portfolio.');
        }
    }

    // === FETCH FROM VERCEL API ===
    async fetchPortfolioFromAPI() {
        try {
            const response = await fetch('/api/portfolio');
            if (!response.ok) {
                throw new Error(`API returned ${response.status}`);
            }
            const data = await response.json();
            this.categories = data.categories || [];
            this.cache = data.items || {};
        } catch (error) {
            console.warn('Could not fetch from /api/portfolio, falling back to mock data for local testing.', error);

            // Mock Data Fallback
            this.categories = [
                { id: 'mock-1', name: 'Commercials' },
                { id: 'mock-2', name: 'Music Videos' }
            ];

            this.cache = {
                'mock-1': [
                    { name: 'Neon Nights', description: 'Automotive Commercial', mimeType: 'image/jpeg', thumbnailLink: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=800' },
                    { name: 'Future Perfect', description: 'Tech Brand Anthem', mimeType: 'video/mp4', thumbnailLink: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800', webViewLink: 'https://www.youtube.com/embed/dQw4w9WgXcQ' } // Using youtube as mock video
                ],
                'mock-2': [
                    { name: 'Echoes', description: 'Indie Artist Promo', mimeType: 'image/jpeg', thumbnailLink: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800' },
                    { name: 'The Void', description: 'Live Performance', mimeType: 'video/mp4', thumbnailLink: 'https://images.unsplash.com/photo-1470229722913-7c090be5bcff?auto=format&fit=crop&q=80&w=800', webViewLink: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
                ]
            };
        }
    }

    // === RENDERING ===
    renderLoadingState() {
        const grid = document.querySelector('.portfolio-grid');
        if (grid) grid.innerHTML = '<div class="cms-loader">Loading Content...</div>';
    }

    renderError(msg) {
        const grid = document.querySelector('.portfolio-grid');
        if (grid) grid.innerHTML = `<div class="cms-error">${msg}</div>`;
    }

    renderFilters() {
        const header = document.querySelector('#portfolio .section-header');
        if (!header) return;

        let filterContainer = document.getElementById('portfolio-filters');
        if (!filterContainer) {
            filterContainer = document.createElement('div');
            filterContainer.id = 'portfolio-filters';
            filterContainer.className = 'portfolio-filters fade-in-scroll';
            header.after(filterContainer);
        }

        filterContainer.innerHTML = '';

        this.categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn';
            btn.textContent = cat.name;
            btn.dataset.id = cat.id;
            btn.onclick = () => this.selectCategory(cat.id);
            filterContainer.appendChild(btn);
        });
    }

    selectCategory(catId) {
        if (this.currentCategory === catId) return;
        this.currentCategory = catId;

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.id === catId);
        });

        this.renderLoadingState();
        const items = this.cache[catId] || [];
        this.renderGrid(items);
    }

    renderGrid(items) {
        const grid = document.querySelector('.portfolio-grid');
        if (!grid) return;

        grid.innerHTML = '';

        if (items.length === 0) {
            grid.innerHTML = '<div class="cms-empty">No items in this category.</div>';
            return;
        }

        items.forEach((item, index) => {
            let imgSrc = item.thumbnailLink || '';

            if (imgSrc) {
                imgSrc = imgSrc.replace('=s220', '=s800');
            }

            const card = document.createElement('article');
            card.className = 'project-card fade-in-up';
            card.style.animationDelay = `${index * 0.1}s`;

            card.innerHTML = `
                <div class="project-image">
                    <div class="placeholder-img" style="background-image:url('${imgSrc}')"></div>
                    <div class="project-overlay">
                        <h3 class="project-title">${item.name}</h3>
                        <p class="project-category">${item.description || 'View Project'}</p>
                    </div>
                </div>
            `;

            card.addEventListener('click', () => {
                this.openModal(item);
            });

            this.attachCursorEvents(card);
            grid.appendChild(card);
        });
    }

    attachCursorEvents(el) {
        const cursor = document.querySelector('.cursor');
        if (!cursor) return;

        el.addEventListener('mouseenter', () => {
            cursor.classList.add('cursor-hover');
        });

        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('cursor-hover');
        });
    }

    initModal() {
        this.modal = document.getElementById('media-modal');
        this.modalContent = document.getElementById('modal-content');
        this.closeBtn = document.querySelector('.modal-close');

        if (!this.modal) return;

        this.closeBtn.addEventListener('click', () => this.closeModal());

        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('open')) {
                this.closeModal();
            }
        });
    }

    openModal(item) {
        if (!this.modal) return;

        this.modalContent.innerHTML = '<div class="cms-loader">Loading...</div>';
        this.modal.classList.add('open');

        // Remove Lenis scroll while modal is open
        if (typeof lenis !== 'undefined') lenis.stop();
        document.body.style.overflow = 'hidden';

        const isVideo = item.mimeType && item.mimeType.includes('video/');

        if (isVideo && item.webViewLink) {
            // For Drive videos, we embed the preview player.
            // Some modifications to the URL might be needed for perfect embedding, 
            // but the webViewLink is generally the safest cross-domain approach.
            let embedUrl = item.webViewLink.replace('/view', '/preview'); // Google Drive specific

            // Mock YouTube URL handling for dev testing
            if (embedUrl.includes('youtube')) embedUrl = item.webViewLink;

            this.modalContent.innerHTML = `<iframe src="${embedUrl}" allowfullscreen frameborder="0" style="width: 80vw; height: 80vh;"></iframe>`;
        } else {
            // It's an image. Optimize loading by NOT using original size (=s0). 
            // =s2048 gives up to 2K resolution which is plenty for 99% of screens and loads fast.
            let mediaUrl = item.thumbnailLink ? item.thumbnailLink.replace('=s220', '=s2048').replace('=s800', '=s2048') : '';

            if (mediaUrl) {
                // Preload image gracefully to remove the loader right when it is ready
                const img = new Image();
                img.onload = () => {
                    this.modalContent.innerHTML = '';
                    this.modalContent.appendChild(img);
                };
                img.src = mediaUrl;
            } else {
                this.modalContent.innerHTML = `<div class="cms-error">Media not available</div>`;
            }
        }
    }

    closeModal() {
        if (!this.modal) return;
        this.modal.classList.remove('open');

        if (typeof lenis !== 'undefined') lenis.start();
        document.body.style.overflow = '';

        setTimeout(() => {
            this.modalContent.innerHTML = '';
        }, 300);
    }
}