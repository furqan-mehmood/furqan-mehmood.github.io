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

// Function to dynamically load projects using PURE TAILWIND classes
async function loadProjects() {
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

        projects.forEach(project => {
            const card = document.createElement('article');
            card.className = 'flex flex-col bg-slate-900 rounded-xl shadow-lg border border-slate-700 overflow-hidden project-card transition-transform duration-300 hover:scale-[1.03]';
            card.dataset.projectId = project.id;

            const techTags = project.tech.slice(0, 4).map(t =>
                `<span class="text-xs font-medium bg-slate-700 text-blue-200 py-1 px-3 rounded-full">${t}</span>`
            ).join('');

            card.innerHTML = `
                <img src="${project.image || 'https://dummyimage.com/400x225/1e293b/60a5fa&text=Project'}" alt="${project.title}" class="w-full aspect-video object-cover border-b border-slate-700">
                
                <div class="p-4 flex flex-col flex-grow">
                    <h3 class="text-lg font-bold text-slate-100 mb-2">${project.title}</h3>
                    <p class="text-slate-400 text-sm flex-grow">
                        ${project.outcome_highlight || project.description.split('.')[0] + '.'}
                    </p>
                    <div class="flex flex-wrap gap-2 mt-4">
                        ${techTags}
                    </div>
                </div>
                
                <div class="flex gap-4 p-4 border-t border-slate-700 bg-slate-900/50">
                    <a href="#" class="js-modal-trigger flex items-center gap-2 text-blue-400 hover:text-emerald-300 text-sm font-medium transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-80"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                        View Details
                    </a>
                    ${project.link && project.link !== "#" ? `
                    <a href="${project.link}" target="_blank" rel="noopener" class="flex items-center gap-2 text-blue-400 hover:text-emerald-300 text-sm font-medium transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-80"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        View Live
                    </a>` : ''}
                </div>
            `;
            portfolioGrid.appendChild(card);
        });

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
        console.error("Failed to load projects:", err);
    }
}

// Dynamically load skills with refined text chip layout
async function loadSkills() {
    try {
        const response = await fetch('data/skills.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const skillsData = await response.json();
        const skillsContainer = document.getElementById('skills-container');
        if(!skillsContainer) return;

        skillsData.forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'mb-4 bg-slate-800 rounded-2xl overflow-hidden shadow-lg border border-slate-700 collapsible-section';

            const skillsHtml = category.skills.map(skill => {
                // If a logo exists, render the icon grid item
                if (skill.logo) {
                    return `
                        <div class="flex flex-col items-center text-center w-20 p-2">
                            <img src="${skill.logo}" alt="${skill.name}" class="h-10 w-10 object-contain mb-2 transition-transform hover:scale-110">
                            <span class="text-slate-400 text-xs">${skill.name}</span>
                        </div>
                    `;
                }
                // If NO logo exists, render a clean text chip
                return `
                    <span class="bg-slate-700 text-blue-200 text-sm font-medium py-1.5 px-3 rounded-full">${skill.name}</span>
                `;
            }).join('');

            // Use a different container class for text chips to get better spacing
            const contentContainerClass = category.skills.some(s => s.logo)
                ? 'flex flex-wrap gap-4 justify-start'
                : 'flex flex-wrap gap-3 justify-start';

            categoryDiv.innerHTML = `
                <button class="w-full text-left px-6 py-4 bg-slate-900/50 hover:bg-slate-700/50 flex justify-between items-center focus:outline-none transition-colors">
                    <h3 class="text-xl font-semibold text-emerald-300">${category.category}</h3>
                    <span class="accordion-arrow text-slate-500 text-2xl font-light transform transition-transform duration-300">&#43;</span>
                </button>
                <div class="accordion-content p-6 hidden">
                    <div class="${contentContainerClass}">
                        ${skillsHtml}
                    </div>
                </div>
            `;
            skillsContainer.appendChild(categoryDiv);
        });

        document.querySelectorAll('#skills-container .collapsible-section button').forEach(btn => {
            btn.addEventListener('click', () => {
                const content = btn.nextElementSibling;
                const arrow = btn.querySelector('.accordion-arrow');
                content.classList.toggle('hidden');
                arrow.classList.toggle('rotate-45');
            });
        });

    } catch (err) {
        console.error("Failed to load skills:", err);
    }
}

// Dynamically load work experience with TIMELINE BAR FIX
async function loadWorkExperience() {
    try {
        const response = await fetch('data/work-experience.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const experiences = await response.json();
        const container = document.getElementById('work-experience-container');
        if(!container) return;

        experiences.forEach((exp, index) => {
            const expDiv = document.createElement('div');
            expDiv.classList.add('relative', 'pb-8', 'timeline-item');

            const processedDescription = exp.description.map(d => d.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-200">$1</strong>'));

            expDiv.innerHTML = `
                ${index < experiences.length - 1 ? '<div class="timeline-line"></div>' : ''}
                <button class="w-full text-left pl-4 pr-1 py-1 flex items-start justify-between focus:outline-none relative z-10">
                    <span class="flex items-start flex-grow">
                        ${exp.logo ? `<img src="${exp.logo}" alt="${exp.company} Logo" class="h-10 w-10 mr-4 mt-1 object-contain rounded-md bg-white p-1">` : '<div class="h-10 w-10 mr-4 mt-1 rounded-md bg-slate-700"></div>'}
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
                    <span class="accordion-arrow text-slate-500 text-2xl font-light transform transition-transform duration-300">&#43;</span>
                </button>
                <div class="accordion-content pt-3 pl-[72px] text-slate-400 hidden">
                    <ul class="list-disc list-outside space-y-2 mb-4 text-sm leading-relaxed">
                        ${processedDescription.map(d => `<li>${d}</li>`).join('')}
                    </ul>
                    ${exp.projects && exp.projects.length ? `<p class="font-semibold text-emerald-400 mb-2 text-sm">Key Projects:</p>
                        <ul class="list-disc list-outside ml-4 space-y-1">
                            ${exp.projects.map(p => `<li><a href="${p.url}" target="_blank" class="text-blue-400 hover:underline text-sm">${p.name}</a></li>`).join('')}
                        </ul>` : ''}
                </div>
            `;
            container.appendChild(expDiv);
        });

        document.querySelectorAll('#work-experience-container button').forEach(btn => {
            btn.addEventListener('click', () => {
                const content = btn.nextElementSibling;
                const arrow = btn.querySelector('.accordion-arrow');
                content.classList.toggle('hidden');
                arrow.classList.toggle('rotate-45');
            });
        });
    } catch (err) {
        console.error("Failed to load work experience:", err);
    }
}

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

document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
    loadSkills();
    loadWorkExperience();
});

