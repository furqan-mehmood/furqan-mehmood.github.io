// Function to handle the scroll-in animation for sections
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('section-visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });
document.querySelectorAll('.section-fade-in').forEach(section => observer.observe(section));


// MODIFIED FUNCTION: Only loads data for the modal, does NOT build project cards.
async function initProjectModalLogic() {
    try {
        const response = await fetch('data/projects.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const projects = await response.json();

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
            const modalTechList = project.tech.map(t =>
                `<span class="inline-block bg-blue-900/50 text-emerald-300 py-1 px-3 rounded-full text-sm font-medium border border-blue-800">${t}</span>`
            ).join('');

            modalBody.innerHTML = `
                <p class="text-slate-100 font-semibold text-lg mb-2">Role: ${project.role}</p>
                <p class="text-slate-300 mb-4 text-base leading-relaxed">${project.description}</p>
                <p class="text-slate-100 font-semibold mb-3">Technologies Used:</p>
                <div class="flex flex-wrap gap-2 mb-6">${modalTechList}</div>
                <img src="${project.image || 'https://dummyimage.com/600x300/1e293b/60a5fa&text=Project'}" class="rounded-lg w-full mb-4 border border-slate-700">
                ${project.link && project.link !== "#" ? `<p><a href="${project.link}" target="_blank" class="text-emerald-300 hover:underline font-bold inline-flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    Visit Live Project
                </a></p>` : ''}
            `;
            modal.classList.remove('hidden');
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
            const descriptionList = exp.description.map(desc => `<li>${desc}</li>`).join('');
            const projectList = exp.projects.map(proj => `<li><a href="${proj.url}" target="_blank" class="text-blue-400 hover:underline text-sm">${proj.name}</a></li>`).join('');

            return `
            <div class="mb-4 bg-slate-900 rounded-2xl overflow-hidden shadow-lg border border-slate-700 collapsible-section">
                <button class="w-full text-left px-6 py-4 bg-slate-900/50 hover:bg-slate-700/50 flex justify-between items-center focus:outline-none transition-colors">
                    <span class="flex items-start flex-grow">
                        <img src="${exp.logo}" alt="${exp.company} Logo" class="h-10 w-10 mr-4 mt-1 object-contain rounded-md bg-white p-1">
                        <span class="flex-grow">
                            <span class="font-semibold text-emerald-300 text-lg">${exp.role}</span>
                            <div class="text-slate-100 font-medium">${exp.company}</div>
                            <div class="text-slate-400 text-sm mt-1">
                                <span>${exp.dates}</span>
                                <span class="mx-2 text-slate-600">•</span>
                                <span>${exp.location}</span>
                            </div>
                        </span>
                    </span>
                    <span class="accordion-arrow text-slate-500 text-2xl font-light transform transition-transform duration-300">+</span>
                </button>
                <div class="accordion-content pt-3 pl-[72px] text-slate-400 hidden">
                    <ul class="list-disc list-outside space-y-2 mb-4 text-sm leading-relaxed">${descriptionList}</ul>
                    ${exp.projects.length > 0 ? `<p class="font-semibold text-emerald-400 mb-2 text-sm">Key Projects:</p><ul class="list-disc list-outside ml-4 space-y-1">${projectList}</ul>` : ''}
                </div>
            </div>
            `;
        }).join('');

        container.innerHTML = dynamicContent;

    } catch (err) {
        console.error("Failed to load work experience data:", err);
    }
}

// NEW FUNCTION: Dynamically generates the Skills section
async function initSkillsSection() {
    const container = document.getElementById('skills-container');
    if (!container) {
        console.error('Skills container not found.');
        return;
    }

    try {
        const response = await fetch('data/skills.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const categories = await response.json();

        const dynamicContent = categories.map(cat => {
            const skillItems = cat.skills.map(skill => {
                if (skill.logo) {
                    return `<div class="flex flex-col items-center text-center w-20 p-2"><img src="${skill.logo}" alt="${skill.name}" class="h-10 w-10 object-contain mb-2 transition-transform hover:scale-110"><span class="text-slate-400 text-xs">${skill.name}</span></div>`;
                } else {
                    return `<span class="bg-slate-700 text-blue-200 text-sm font-medium py-1.5 px-3 rounded-full">${skill.name}</span>`;
                }
            }).join('');

            const contentClass = cat.skills.some(skill => skill.logo) ? "flex flex-wrap gap-4 justify-start" : "flex flex-wrap gap-3 justify-start";

            return `
                <div class="mb-4 bg-slate-800 rounded-2xl overflow-hidden shadow-lg border border-slate-700 collapsible-section">
                    <button class="w-full text-left px-6 py-4 bg-slate-900/50 hover:bg-slate-700/50 flex justify-between items-center focus:outline-none transition-colors">
                        <h3 class="text-xl font-semibold text-emerald-300">${cat.category}</h3>
                        <span class="accordion-arrow text-slate-500 text-2xl font-light transform transition-transform duration-300">+</span>
                    </button>
                    <div class="accordion-content p-6 hidden">
                        <div class="${contentClass}">
                            ${skillItems}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = dynamicContent;

    } catch (err) {
        console.error("Failed to load skills data:", err);
    }
}

// MODIFIED FUNCTION: Attaches listeners to the (now dynamic) accordions.
function initAccordionListeners() {
    document.querySelectorAll('.collapsible-section button').forEach(btn => {
        btn.addEventListener('click', () => {
            const parent = btn.closest('.collapsible-section');
            const content = parent.querySelector('.accordion-content');
            const arrow = btn.querySelector('.accordion-arrow');

            const isHidden = content.classList.contains('hidden');

            // Close all other open accordions
            document.querySelectorAll('.collapsible-section').forEach(section => {
                const otherContent = section.querySelector('.accordion-content');
                const otherArrow = section.querySelector('.accordion-arrow');
                if (otherContent && otherArrow && section !== parent) {
                    otherContent.classList.add('hidden');
                    otherArrow.classList.remove('rotate-45');
                }
            });

            // Toggle the clicked accordion
            content.classList.toggle('hidden', !isHidden);
            arrow.classList.toggle('rotate-45', isHidden);

            // Add margin to the opened accordion's content to separate it from the next item
            const openedContent = document.querySelector('.accordion-content:not(.hidden)');
            if (openedContent) {
                openedContent.style.marginBottom = '1rem'; // Add margin
            }
        });
    });
}

// Contact Form Logic (Unchanged)
const form = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        formStatus.textContent = 'Sending...';
        formStatus.classList.remove('text-emerald-400', 'text-red-400');
        formStatus.classList.add('text-slate-400');

        const formData = new FormData(form);
        const response = await fetch(form.action, {
            method: form.method,
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            formStatus.textContent = 'Thank you! Your message has been sent.';
            formStatus.classList.add('text-emerald-400');
            form.reset();
        } else {
            formStatus.textContent = 'Oops! There was a problem sending your message.';
            formStatus.classList.add('text-red-400');
        }
    });
}

// Corrected DOMContentLoaded
document.addEventListener('DOMContentLoaded', async () => {
    await initProjectModalLogic();
    await initExperienceSection();
    await initSkillsSection();
    initAccordionListeners();
});