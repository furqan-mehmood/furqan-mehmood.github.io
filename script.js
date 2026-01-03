// Wrap everything in an IIFE to prevent execution in Node.js
(function() {
    'use strict';
    
    // Browser environment check - exit gracefully if running in Node.js
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        console.warn('⚠️  This script is designed to run in a browser environment.');
        console.warn('💡 To run the portfolio, use: npm start  or  npm run serve');
        if (typeof module !== 'undefined' && module.exports) {
            module.exports = {};
        }
        return; // Exit early if not in browser
    }

// Mobile menu toggle
function initMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');
    
    if (!menuBtn || !mobileMenu) return;
    
    menuBtn.addEventListener('click', () => {
        const isHidden = mobileMenu.classList.contains('hidden');
        mobileMenu.classList.toggle('hidden', !isHidden);
        menuIcon.classList.toggle('hidden', !isHidden);
        closeIcon.classList.toggle('hidden', isHidden);
        menuBtn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
    });
    
    // Close menu when clicking on a link
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            menuIcon.classList.remove('hidden');
            closeIcon.classList.add('hidden');
            menuBtn.setAttribute('aria-expanded', 'false');
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!mobileMenu.contains(e.target) && !menuBtn.contains(e.target)) {
            mobileMenu.classList.add('hidden');
            menuIcon.classList.remove('hidden');
            closeIcon.classList.add('hidden');
            menuBtn.setAttribute('aria-expanded', 'false');
        }
    });
}

// Smooth scroll for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Function to handle the scroll-in animation for sections
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('section-visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });


async function initPortfolioGrid() {
    const container = document.getElementById('portfolio-grid');
    if (!container) {
        console.error('Portfolio grid container not found.');
        return;
    }

    try {
        const response = await fetch('data/projects.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const projects = await response.json();

        const dynamicContent = projects.map(project => {
            const techList = project.tech.map(t => `<span class="text-xs font-medium bg-accent-blue/50 text-light-text py-1 px-3 rounded-full">${t}</span>`).join('');
            const projectCardClass = `flex flex-col bg-dark-bg rounded-xl shadow-xl border border-dark-border overflow-hidden project-card transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:-translate-y-1 hover:border-accent-blue/50 ${project.active === false ? 'opacity-75' : ''}`;

            return `
            <article class="${projectCardClass}" data-project-id="${project.id}">
                <img src="${project.image}" alt="${project.title}" class="w-full aspect-video object-cover border-b border-dark-border">
                <div class="p-4 flex flex-col flex-grow">
                    <h3 class="text-lg font-bold text-light-text mb-2">${project.title}</h3>
                    <p class="text-medium-text text-sm flex-grow">${project.short_description}</p>
                    <div class="flex flex-wrap gap-2 mt-4">
                        ${techList}
                    </div>
                </div>
                <div class="flex gap-3 p-4 border-t border-dark-border bg-dark-bg/50">
                    <a href="#" class="js-modal-trigger flex items-center gap-2 text-light-text hover:text-accent-emerald text-sm font-medium transition-all hover:gap-3 px-3 py-2 rounded-lg hover:bg-dark-card/50">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                        View Details
                    </a>
                    ${project.link && project.link !== "#" ? `<a href="${project.link}" target="_blank" rel="noopener" class="flex items-center gap-2 text-light-text hover:text-accent-emerald text-sm font-medium transition-all hover:gap-3 px-3 py-2 rounded-lg hover:bg-dark-card/50">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                        View Live
                    </a>` : ''}
                </div>
            </article>
            `;
        }).join('');

        container.innerHTML = dynamicContent;
        // After rendering projects, initialize the modal logic that depends on them
        initProjectModalLogic(projects);

    } catch (err) {
        console.error("Failed to load portfolio projects:", err);
        showErrorState(container, 'Failed to load projects.');
    }
}

// MODIFIED FUNCTION: Only loads data for the modal, does NOT build project cards.
async function initProjectModalLogic(projects) {
    try {
        const portfolioGrid = document.getElementById('portfolio-grid');
        const modal = document.getElementById('project-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');

        if (!portfolioGrid || !modal || !modalTitle || !modalBody) {
            console.error('Missing essential portfolio/modal elements in the DOM.');
            return;
        }

        // Keep the MODAL LISTENER, which relies on the fetched JSON data.
        portfolioGrid.addEventListener('click', (e) => {
            const modalTrigger = e.target.closest('.js-modal-trigger');
            if (!modalTrigger) return;

            e.preventDefault();

            const card = e.target.closest('.project-card');
            if (!card) return;

            const projectId = card.dataset.projectId;
            const project = projects.find(p => p.id === projectId);
            if (!project) return;

            modalTitle.textContent = project.title;
            const modalTechList = project.tech.map(t => `<span class="inline-block bg-accent-blue/50 text-light-text py-1 px-3 rounded-full text-sm font-medium border border-accent-blue">${t}</span>`).join('');

            modalBody.innerHTML = `
                <p class="text-light-text font-semibold text-lg mb-2">Role: ${project.role}</p>
                <p class="text-light-text mb-4 text-base leading-relaxed">${project.description}</p>
                <p class="text-light-text font-semibold mb-3">Technologies Used:</p>
                <div class="flex flex-wrap gap-2 mb-6">${modalTechList}</div>
                <img src="${project.image || 'https://dummyimage.com/600x300/1e293b/60a5fa&text=Project'}" class="rounded-lg w-full mb-4 border border-dark-border" alt="${project.title}">
                ${project.link && project.link !== "#" ? `<p><a href="${project.link}" target="_blank" rel="noopener" class="text-accent-emerald hover:text-accent-emerald hover:underline font-bold inline-flex items-center gap-2 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    Visit Live Project
                </a></p>` : ''}
            `;
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        });

    } catch (err) {
        console.error("Failed to load project modal data:", err);
    }
}

// NEW FUNCTION: Dynamically generates the Experience section
async function initExperienceSection() {
    const container = document.getElementById('work-experience-container');
    if (!container) {
        console.error('Work experience container not found.');
        return;
    }

    try {
        const response = await fetch('data/work-experience.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const experiences = await response.json();

        const dynamicContent = experiences.map(exp => {
            const descriptionList = exp.description.map(desc => `<li class="mb-2">${desc}</li>`).join('');
            const projectList = exp.projects.map(proj => `<li class="mb-1"><a href="${proj.url}" target="_blank" rel="noopener" class="text-light-text hover:text-accent-emerald hover:underline text-sm transition-colors">${proj.name}</a></li>`).join('');

            return `
            <div class="mb-4 bg-dark-bg rounded-2xl overflow-hidden shadow-lg border border-dark-border collapsible-section hover:border-accent-emerald transition-colors hover:scale-[1.01]">
                <button class="w-full text-left px-6 py-4 bg-dark-bg/50 hover:bg-dark-border/50 flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-accent-blue rounded-lg transition-colors" aria-expanded="false">
                    <span class="flex items-start flex-grow gap-4">
                        <img src="${exp.logo}" alt="${exp.company} Logo" class="h-12 w-12 object-contain rounded-md bg-white p-1.5 flex-shrink-0" onerror="this.style.display='none'">
                        <span class="flex-grow">
                            <span class="font-semibold text-accent-emerald text-lg block mb-1">${exp.role}</span>
                            <div class="text-light-text font-medium mb-1">${exp.company}</div>
                            <div class="text-medium-text text-sm">
                                <span>${exp.dates}</span>
                                <span class="mx-2 text-medium-text">•</span>
                                <span>${exp.location}</span>
                            </div>
                        </span>
                    </span>
                    <svg class="accordion-arrow w-6 h-6 text-medium-text transform transition-transform duration-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
                <div class="accordion-content px-6 pb-6 pt-2 text-medium-text hidden">
                    <ul class="list-disc list-outside space-y-2 mb-4 text-sm leading-relaxed ml-4">${descriptionList}</ul>
                    ${exp.projects.length > 0 ? `<p class="font-semibold text-accent-emerald mb-2 text-sm">Key Projects:</p><ul class="list-disc list-outside ml-4 space-y-1">${projectList}</ul>` : ''}
                </div>
            </div>
            `;
        }).join('');

        container.innerHTML = dynamicContent;

    } catch (err) {
        console.error("Failed to load work experience data:", err);
        throw err;
    }
}

// NEW FUNCTION: Dynamically generates the Skills section
async function initSkillsSection() {
    const container = document.getElementById('skills-container');
    if (!container) {
        console.error('Skills container not found.');
        return;
    }
    console.log('1. initSkillsSection started');

    try {
        const response = await fetch('data/skills.json');
        console.log('2. Fetched data/skills.json', response);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const categories = await response.json();
        console.log('3. Parsed skills JSON', categories);

        const dynamicContent = categories.map(cat => {
            const skillItems = cat.skills.map(skill => {
                if (skill.logo) {
                    return `<div class="flex flex-col items-center text-center w-20 p-2"><img src="${skill.logo}" alt="${skill.name}" class="h-10 w-10 object-contain mb-2 transition-transform hover:scale-110" onerror="this.style.display='none'"><span class="text-medium-text text-xs">${skill.name}</span></div>`;
                } else {
                    return `<span class="bg-accent-blue/50 text-light-text text-sm font-medium py-1.5 px-3 rounded-full">${skill.name}</span>`;
                }
            }).join('');

            const contentClass = cat.skills.some(skill => skill.logo) ? "flex flex-wrap gap-4 justify-start" : "flex flex-wrap gap-3 justify-start";

            return `
                <div class="mb-4 bg-dark-card rounded-2xl overflow-hidden shadow-lg border border-dark-border collapsible-section hover:border-accent-emerald transition-colors hover:scale-[1.01]">
                    <button class="w-full text-left px-6 py-4 bg-dark-bg/50 hover:bg-dark-border/50 flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-accent-blue rounded-lg transition-colors" aria-expanded="false">
                        <h3 class="text-xl font-semibold text-accent-emerald">${cat.category}</h3>
                        <svg class="accordion-arrow w-6 h-6 text-medium-text transform transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </button>
                    <div class="accordion-content p-6 hidden">
                        <div class="${contentClass}">
                            ${skillItems}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        console.log('4. Generated dynamicContent for skills');

        container.innerHTML = dynamicContent;
        console.log('5. Set innerHTML for skills container');

    } catch (err) {
        console.error("Failed to load skills data:", err);
        showErrorState(container, 'Failed to load skills.');
    }
}

// MODIFIED FUNCTION: Attaches listeners to the (now dynamic) accordions.
function initAccordionListeners() {
    document.querySelectorAll('.collapsible-section button').forEach(btn => {
        btn.addEventListener('click', () => {
            const parent = btn.closest('.collapsible-section');
            const content = parent.querySelector('.accordion-content');
            const arrow = btn.querySelector('.accordion-arrow');

            if (!content || !arrow) return;

            const isHidden = content.classList.contains('hidden');

            // Close all other open accordions (optional - remove if you want multiple open)
            document.querySelectorAll('.collapsible-section').forEach(section => {
                const otherContent = section.querySelector('.accordion-content');
                const otherArrow = section.querySelector('.accordion-arrow');
                if (otherContent && otherArrow && section !== parent) {
                    otherContent.classList.add('hidden');
                    otherArrow.classList.remove('rotated');
                    const otherBtn = section.querySelector('button');
                    if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
                }
            });

            // Toggle the clicked accordion
            content.classList.toggle('hidden', !isHidden);
            arrow.classList.toggle('rotated', isHidden);
            
            // Update aria-expanded
            btn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
        });
    });
}

// Contact Form Logic with validation
function initContactForm() {
    const form = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    const submitBtn = document.getElementById('submit-btn');
    const submitText = document.getElementById('submit-text');
    const submitSpinner = document.getElementById('submit-spinner');
    const messageInput = document.getElementById('message');
    const messageError = document.getElementById('message-error');
    const fileInput = document.getElementById('attachment');
    const fileInfo = document.getElementById('file-info');

    if (!form) return;

    // File input feedback
    if (fileInput && fileInfo) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
                if (file.size > 10 * 1024 * 1024) {
                    fileInfo.textContent = 'File size exceeds 10MB. Please choose a smaller file.';
                    fileInfo.classList.add('text-red-500');
                    fileInfo.classList.remove('text-medium-text');
                    fileInput.value = '';
                } else {
                    fileInfo.textContent = `Selected: ${file.name} (${fileSizeMB} MB)`;
                    fileInfo.classList.remove('text-red-500');
                    fileInfo.classList.add('text-accent-emerald');
                }
            } else {
                fileInfo.textContent = '';
            }
        });
    }

    // Message validation
    if (messageInput && messageError) {
        messageInput.addEventListener('input', () => {
            if (messageInput.value.length < 10) {
                messageError.textContent = 'Message must be at least 10 characters long.';
                messageError.classList.add('text-red-500');
                messageError.classList.remove('text-medium-text');
            } else {
                messageError.textContent = '';
            }
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate message length
        if (messageInput && messageInput.value.length < 10) {
            formStatus.textContent = 'Please enter a message with at least 10 characters.';
            formStatus.classList.remove('text-accent-emerald');
            formStatus.classList.add('text-red-500');
            return;
        }

        // Validate file size if file is selected
        if (fileInput && fileInput.files[0] && fileInput.files[0].size > 10 * 1024 * 1024) {
            formStatus.textContent = 'File size exceeds 10MB. Please choose a smaller file.';
            formStatus.classList.remove('text-accent-emerald');
            formStatus.classList.add('text-red-500');
            return;
        }

        // Show loading state
        submitBtn.disabled = true;
        submitText.textContent = 'Sending...';
        submitSpinner.classList.remove('hidden');
        formStatus.textContent = '';
        formStatus.classList.remove('text-accent-emerald', 'text-red-500');

        try {
            const formData = new FormData(form);
            const response = await fetch(form.action, {
                method: form.method,
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                formStatus.textContent = '✓ Thank you! Your message has been sent. I\'ll get back to you soon.';
                formStatus.classList.add('text-accent-emerald');
                formStatus.classList.remove('text-red-500');
                form.reset();
                if (fileInfo) fileInfo.textContent = '';
                if (messageError) messageError.textContent = '';
            } else {
                const data = await response.json();
                formStatus.textContent = data.error || 'Oops! There was a problem sending your message. Please try again.';
                formStatus.classList.add('text-red-500');
                formStatus.classList.remove('text-accent-emerald');
            }
        } catch (error) {
            formStatus.textContent = 'Network error. Please check your connection and try again.';
            formStatus.classList.add('text-red-500');
            formStatus.classList.remove('text-accent-emerald');
        } finally {
            submitBtn.disabled = false;
            submitText.textContent = 'Send Message';
            submitSpinner.classList.add('hidden');
        }
    });
}

// Loading states for dynamic content
function showLoadingState(container, message = 'Loading...') {
    if (container) {
        container.innerHTML = `
            <div class="flex items-center justify-center py-12">
                <div class="text-center">
                    <svg class="animate-spin h-8 w-8 text-accent-blue mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p class="text-medium-text">${message}</p>
                </div>
            </div>
        `;
    }
}

function showErrorState(container, message = 'Failed to load content. Please refresh the page.') {
    if (container) {
        container.innerHTML = `
            <div class="flex items-center justify-center py-12">
                <div class="text-center">
                    <svg class="h-8 w-8 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p class="text-medium-text">${message}</p>
                </div>
            </div>
        `;
    }
}

// Corrected DOMContentLoaded
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize static features first
    initMobileMenu();
    initSmoothScroll();
    document.querySelectorAll('.section-fade-in').forEach(section => observer.observe(section));
    
    // Initialize dynamic content with loading states
    const experienceContainer = document.getElementById('work-experience-container');
    const skillsContainer = document.getElementById('skills-container');
    const portfolioContainer = document.getElementById('portfolio-grid');
    
    if (experienceContainer) showLoadingState(experienceContainer, 'Loading experience...');
    if (skillsContainer) showLoadingState(skillsContainer, 'Loading skills...');
    if (portfolioContainer) showLoadingState(portfolioContainer, 'Loading projects...');
    
    try {
        await Promise.all([
            initPortfolioGrid().catch(err => {
                console.error('Portfolio section error:', err);
                if (portfolioContainer) showErrorState(portfolioContainer);
            }),
            initExperienceSection().catch(err => {
                console.error('Experience section error:', err);
                if (experienceContainer) showErrorState(experienceContainer);
            }),
            initSkillsSection().catch(err => {
                console.error('Skills section error:', err);
                if (skillsContainer) showErrorState(skillsContainer);
            })
        ]);
        
        // Initialize accordions after content is loaded
        initAccordionListeners();
    } catch (err) {
        console.error('Initialization error:', err);
    }
    
    // Initialize contact form
    initContactForm();
});

})(); // End of IIFE - prevents execution in Node.js