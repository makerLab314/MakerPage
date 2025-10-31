// Mobile menu toggle
function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('active');
}

// Load and render projects dynamically
async function loadProjects() {
    try {
        const response = await fetch('projects.json');
        const projects = await response.json();
        const projectsGrid = document.getElementById('projects-grid');
        
        projectsGrid.innerHTML = projects.map(project => `
            <div class="project-card fade-in glass-card" data-project='${JSON.stringify(project)}'>
                <div class="project-image">
                    <img src="${project.image}" alt="${project.titel}" class="project-img">
                </div>
                <div class="project-content">
                    <h3>${project.titel}</h3>
                    <p>${project.beschreibung}</p>
                    <div class="project-tech">
                        ${project.technologien.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add click handlers to open modal
        document.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('click', function() {
                const project = JSON.parse(this.getAttribute('data-project'));
                openProjectModal(project);
            });
        });
        
        // Re-observe fade-in elements
        document.querySelectorAll('.project-card').forEach(el => observer.observe(el));
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

// Open project modal with details
function openProjectModal(project) {
    const modal = document.getElementById('projectModal');
    const modalContent = document.getElementById('modalProjectContent');
    
    modalContent.innerHTML = `
        <div class="modal-image">
            <img src="${project.image}" alt="${project.titel}" class="modal-project-img">
        </div>
        <h2>${project.titel}</h2>
        <p>${project.detailbeschreibung || project.beschreibung}</p>
        <div class="project-tech">
            ${project.technologien.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
        </div>
    `;
    
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

// Load and render news dynamically
async function loadNews() {
    try {
        const response = await fetch('news.json');
        const newsItems = await response.json();
        const newsGrid = document.getElementById('news-grid');
        
        newsGrid.innerHTML = newsItems.map(item => `
            <div class="news-card fade-in">
                <div class="news-date">${formatDate(item.datum)}</div>
                <h3>${item.titel}</h3>
                <p>${item.inhalt}</p>
            </div>
        `).join('');
        
        // Re-observe fade-in elements
        document.querySelectorAll('.news-card').forEach(el => observer.observe(el));
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

// Smooth scrolling for navigation links
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

// Intersection Observer for fade-in animations
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

// Observe all elements with fade-in class
document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// Tool card click handlers
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
        const notification = document.createElement('div');
        notification.textContent = `Coming Soon: ${toolName}!`;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            padding: 1rem 2rem;
            border-radius: 50px;
            box-shadow: 0 10px 30px rgba(0, 212, 255, 0.5);
            z-index: 10000;
            font-weight: 600;
            animation: slideDown 0.3s ease;
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    });
});

// Active navigation highlighting and parallax with throttling
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

            // Parallax effect for hero section
            const hero = document.querySelector('.hero');
            if (hero) {
                hero.style.transform = `translateY(${scrollY * 0.5}px)`;
            }

            ticking = false;
        });
        ticking = true;
    }
});

// Initialize: Load dynamic content when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
    loadNews();
    
    // Console easter egg for nerds
    console.log('%c🔧 MakerLab Frankfurt 🔧', 'font-size: 24px; color: #00d4ff; font-weight: bold;');
    console.log('%cWillkommen, fellow Maker! 👋', 'font-size: 16px; color: #ff006e;');
    console.log('%cInteressiert an unserem Code? Schau dir unser GitHub an!', 'font-size: 14px; color: #ffbe0b;');
    console.log('%c// TODO: Build something awesome! 🚀', 'font-size: 12px; color: #a0a0a0; font-style: italic;');
});
