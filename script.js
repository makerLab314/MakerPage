// Mobile menu toggle
function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('active');
}

// ============================================
// CUSTOM CURSOR EFFECTS
// ============================================
const MOBILE_BREAKPOINT = 768;
let cursorX = 0, cursorY = 0;
let trailX = 0, trailY = 0;

if (window.innerWidth > MOBILE_BREAKPOINT) {
    const cursor = document.querySelector('.custom-cursor');
    const trail = document.querySelector('.cursor-trail');
    
    document.addEventListener('mousemove', (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
    });

    // Smooth trail following
    function animateTrail() {
        trailX += (cursorX - trailX) * 0.15;
        trailY += (cursorY - trailY) * 0.15;
        trail.style.left = trailX + 'px';
        trail.style.top = trailY + 'px';
        requestAnimationFrame(animateTrail);
    }
    animateTrail();

    // Hover effect on interactive elements
    document.querySelectorAll('a, button, .project-card, .tool-card, .equipment-card, .news-card, .team-card').forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
}

// ============================================
// SCROLL PROGRESS BAR
// ============================================
window.addEventListener('scroll', () => {
    const scrollProgress = document.querySelector('.scroll-progress');
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    scrollProgress.style.width = scrollPercent + '%';
});

// ============================================
// RIPPLE EFFECT ON CLICKS
// ============================================
function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.classList.add('ripple');
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';

    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
}

// Add ripple to all buttons and clickable elements
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.btn, button, .project-card, .tool-card').forEach(el => {
        el.addEventListener('click', createRipple);
    });
});

// ============================================
// LAZY LOADING FOR IMAGES
// ============================================
const lazyLoadImages = () => {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
};

// ============================================
// LIGHTBOX GALLERY
// ============================================
let currentImageIndex = 0;
let currentGalleryImages = [];

function openLightbox(images, startIndex = 0) {
    currentGalleryImages = images;
    currentImageIndex = startIndex;
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.add('active');
    updateLightboxImage();
    createThumbnails();
}

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
}

function updateLightboxImage() {
    const img = document.getElementById('lightbox-img');
    img.src = currentGalleryImages[currentImageIndex];
    img.alt = `Gallery image ${currentImageIndex + 1} of ${currentGalleryImages.length}`;
    updateActiveThumbnail();
}

function createThumbnails() {
    const container = document.getElementById('lightbox-thumbnails');
    container.innerHTML = ''; // Clear existing thumbnails
    
    currentGalleryImages.forEach((src, index) => {
        const thumb = document.createElement('img');
        thumb.src = src;
        thumb.className = `lightbox-thumbnail ${index === currentImageIndex ? 'active' : ''}`;
        thumb.alt = `Thumbnail ${index + 1}`;
        thumb.addEventListener('click', () => {
            currentImageIndex = index;
            updateLightboxImage();
        });
        container.appendChild(thumb);
    });
}

function updateActiveThumbnail() {
    document.querySelectorAll('.lightbox-thumbnail').forEach((thumb, index) => {
        thumb.classList.toggle('active', index === currentImageIndex);
    });
}

function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % currentGalleryImages.length;
    updateLightboxImage();
}

function prevImage() {
    currentImageIndex = (currentImageIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
    updateLightboxImage();
}

// Lightbox event listeners
document.addEventListener('DOMContentLoaded', () => {
    const lightbox = document.getElementById('lightbox');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');

    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', (e) => { e.stopPropagation(); prevImage(); });
    nextBtn.addEventListener('click', (e) => { e.stopPropagation(); nextImage(); });

    // Close on outside click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') prevImage();
        if (e.key === 'ArrowRight') nextImage();
    });

    // Swipe support for mobile
    let touchStartX = 0;
    lightbox.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    });

    lightbox.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) nextImage();
            else prevImage();
        }
    });
});

// ============================================
// LOAD AND RENDER PROJECTS WITH GALLERY
// ============================================
async function loadProjects() {
    try {
        const response = await fetch('projects.json');
        const projects = await response.json();
        const projectsGrid = document.getElementById('projects-grid');
        
        // Clear existing content
        projectsGrid.innerHTML = '';
        
        projects.forEach(project => {
            const card = document.createElement('div');
            card.className = 'project-card fade-in glass-card';
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            
            // Project image container
            const imgContainer = document.createElement('div');
            imgContainer.className = 'project-image';
            const img = document.createElement('img');
            img.src = project.image;
            img.alt = project.titel;
            img.className = 'project-img';
            img.loading = 'lazy';
            imgContainer.appendChild(img);
            card.appendChild(imgContainer);
            
            // Project content
            const content = document.createElement('div');
            content.className = 'project-content';
            
            const title = document.createElement('h3');
            title.textContent = project.titel;
            content.appendChild(title);
            
            const desc = document.createElement('p');
            desc.textContent = project.beschreibung;
            content.appendChild(desc);
            
            const techDiv = document.createElement('div');
            techDiv.className = 'project-tech';
            project.technologien.forEach(tech => {
                const tag = document.createElement('span');
                tag.className = 'tech-tag';
                tag.textContent = tech;
                techDiv.appendChild(tag);
            });
            content.appendChild(techDiv);
            
            card.appendChild(content);
            
            // Add event listeners
            card.addEventListener('click', (e) => {
                createRipple(e);
                openProjectModal(project);
            });
            
            // Keyboard support
            card.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openProjectModal(project);
                }
            });
            
            projectsGrid.appendChild(card);
            
            // Observe for animations
            observer.observe(card);
        });
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

// Open project modal with gallery button
function openProjectModal(project) {
    const modal = document.getElementById('projectModal');
    const modalContent = document.getElementById('modalProjectContent');
    
    // Clear previous content
    modalContent.innerHTML = '';
    
    const hasGallery = project.images && project.images.length > 1;
    
    // Create gallery button if applicable
    if (hasGallery) {
        const galleryBtn = document.createElement('button');
        galleryBtn.className = 'gallery-button';
        galleryBtn.textContent = '📸 Galerie öffnen';
        galleryBtn.addEventListener('click', () => openLightbox(project.images));
        modalContent.appendChild(galleryBtn);
    }
    
    // Create image container
    const imageDiv = document.createElement('div');
    imageDiv.className = 'modal-image';
    const img = document.createElement('img');
    img.src = project.image;
    img.alt = project.titel;
    img.className = 'modal-project-img';
    img.loading = 'lazy';
    imageDiv.appendChild(img);
    modalContent.appendChild(imageDiv);
    
    // Create title
    const title = document.createElement('h2');
    title.id = 'modal-title';
    title.textContent = project.titel;
    modalContent.appendChild(title);
    
    // Create description
    const desc = document.createElement('p');
    desc.textContent = project.detailbeschreibung || project.beschreibung;
    modalContent.appendChild(desc);
    
    // Create tech tags
    const techDiv = document.createElement('div');
    techDiv.className = 'project-tech';
    project.technologien.forEach(tech => {
        const tag = document.createElement('span');
        tag.className = 'tech-tag';
        tag.textContent = tech;
        techDiv.appendChild(tag);
    });
    modalContent.appendChild(techDiv);
    
    modal.style.display = 'block';
}

// Close modal
function closeModal() {
    document.getElementById('projectModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('projectModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// ============================================
// LOAD AND RENDER NEWS
// ============================================
async function loadNews() {
    try {
        const response = await fetch('news.json');
        const newsItems = await response.json();
        const newsGrid = document.getElementById('news-grid');
        
        // Clear existing content
        newsGrid.innerHTML = '';
        
        newsItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'news-card fade-in';
            
            const dateDiv = document.createElement('div');
            dateDiv.className = 'news-date';
            dateDiv.textContent = formatDate(item.datum);
            card.appendChild(dateDiv);
            
            const title = document.createElement('h3');
            title.textContent = item.titel;
            card.appendChild(title);
            
            const content = document.createElement('p');
            content.textContent = item.inhalt;
            card.appendChild(content);
            
            newsGrid.appendChild(card);
            
            // Observe for animations
            observer.observe(card);
        });
    } catch (error) {
        console.error('Error loading news:', error);
    }
}

// Format date to German format
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', options);
}

// ============================================
// SMOOTH SCROLLING
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Close mobile menu if open
            document.getElementById('navLinks').classList.remove('active');
        }
    });
});

// ============================================
// INTERSECTION OBSERVER FOR ANIMATIONS
// ============================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all elements with animation classes
document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .slide-in-bottom').forEach(el => observer.observe(el));

// ============================================
// TOOL CARD CLICK HANDLERS
// ============================================
document.querySelectorAll('.tool-card[data-tool]').forEach(card => {
    card.addEventListener('click', function() {
        const toolName = this.getAttribute('data-tool');
        
        // Special handling for 3D Model Viewer
        if (toolName === '3D Model Viewer') {
            const container = document.getElementById('model-viewer-container');
            container.classList.toggle('active');
            
            if (container.classList.contains('active')) {
                container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
            return;
        }
        
        // Create a notification for other tools
        showNotification(`Coming Soon: ${toolName}!`);
    });
});

// Notification helper
function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        color: white;
        padding: 1rem 2rem;
        border-radius: 50px;
        box-shadow: 0 10px 30px rgba(0, 184, 212, 0.5);
        z-index: 10000;
        font-weight: 600;
        animation: slideDown 0.3s ease;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// ============================================
// PARALLAX & ACTIVE NAV WITH THROTTLING
// ============================================
let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            const sections = document.querySelectorAll('section[id]');
            const scrollY = window.pageYOffset;

            // Active navigation highlighting
            sections.forEach(section => {
                const sectionHeight = section.offsetHeight;
                const sectionTop = section.offsetTop - 100;
                const sectionId = section.getAttribute('id');
                const navLink = document.querySelector(`.nav-links a[href="#${sectionId}"]`);

                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    navLink?.classList.add('active');
                } else {
                    navLink?.classList.remove('active');
                }
            });

            // Enhanced parallax effect
            const hero = document.querySelector('.hero');
            if (hero && scrollY < window.innerHeight) {
                const heroContent = hero.querySelector('.hero-content');
                hero.style.transform = `translateY(${scrollY * 0.5}px)`;
                
                // Calculate opacity based on scroll position
                const fadeStart = 0;
                const fadeEnd = window.innerHeight * 0.8;
                const opacity = scrollY < fadeStart ? 1 : 
                               scrollY > fadeEnd ? 0 : 
                               1 - ((scrollY - fadeStart) / (fadeEnd - fadeStart));
                
                if (heroContent) {
                    heroContent.style.opacity = opacity;
                    heroContent.style.transform = `translateY(${scrollY * 0.3}px)`;
                }
            }

            ticking = false;
        });
        ticking = true;
    }
});

// ============================================
// KONAMI CODE EASTER EGG
// ============================================
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;

document.addEventListener('keydown', (e) => {
    if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
            activateMatrixMode();
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});

function activateMatrixMode() {
    console.log('%c🎉 KONAMI CODE ACTIVATED! 🎉', 'font-size: 24px; color: #00ff00; font-weight: bold;');
    console.log('%cMatrix Mode: ENABLED', 'font-size: 18px; color: #00ff00;');
    
    // Add matrix effect
    const matrixContainer = document.getElementById('matrix-container');
    document.body.classList.add('matrix-active');
    
    // Create falling matrix characters
    for (let i = 0; i < 50; i++) {
        setTimeout(() => createMatrixChar(), i * 100);
    }
    
    // Create confetti
    createConfetti();
    
    // Show notification
    showNotification('🎮 Matrix Mode Activated! 🎮');
    
    // Auto-disable after 10 seconds
    setTimeout(() => {
        document.body.classList.remove('matrix-active');
        matrixContainer.innerHTML = '';
    }, 10000);
}

function createMatrixChar() {
    const container = document.getElementById('matrix-container');
    const char = document.createElement('div');
    char.className = 'matrix-char';
    // Generate random Katakana characters (Unicode range 0x30A0-0x30FF)
    const KATAKANA_START = 0x30A0;
    const KATAKANA_RANGE = 96;
    char.textContent = String.fromCharCode(KATAKANA_START + Math.floor(Math.random() * KATAKANA_RANGE));
    char.style.left = Math.random() * 100 + '%';
    char.style.animationDuration = (Math.random() * 3 + 2) + 's';
    container.appendChild(char);
    
    setTimeout(() => char.remove(), 5000);
}

function createConfetti() {
    const colors = ['#00b8d4', '#d81b60', '#ffa726', '#00ff00', '#ff00ff', '#ffff00'];
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = Math.random() * -100 + 'px';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            confetti.style.animationDelay = (Math.random() * 0.5) + 's';
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 4000);
        }, i * 30);
    }
}

// ============================================
// LOGO TRIPLE-CLICK EASTER EGG
// ============================================
let logoClickCount = 0;
let logoClickTimer = null;

document.querySelector('.logo').addEventListener('click', () => {
    logoClickCount++;
    
    if (logoClickTimer) clearTimeout(logoClickTimer);
    
    if (logoClickCount === 3) {
        console.log('%c🔧 SECRET UNLOCKED! 🔧', 'font-size: 20px; color: #ffa726; font-weight: bold;');
        showNotification('🎨 You found the secret! Keep making! 🚀');
        createConfetti();
        logoClickCount = 0;
    } else {
        logoClickTimer = setTimeout(() => {
            logoClickCount = 0;
        }, 500);
    }
});

// ============================================
// INITIALIZE
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
    loadNews();
    lazyLoadImages();
    
    // Console easter egg for nerds
    console.log('%c🔧 MakerLab Frankfurt 🔧', 'font-size: 24px; color: #00b8d4; font-weight: bold;');
    console.log('%cWillkommen, fellow Maker! 👋', 'font-size: 16px; color: #d81b60;');
    console.log('%cInteressiert an unserem Code? Schau dir unser GitHub an!', 'font-size: 14px; color: #ffa726;');
    console.log('%c// TODO: Build something awesome! 🚀', 'font-size: 12px; color: #a0a0a0; font-style: italic;');
    console.log('%cTipp: Probier mal den Konami Code... ↑↑↓↓←→←→BA', 'font-size: 12px; color: #00b8d4;');
});
