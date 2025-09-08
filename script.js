// Function to handle the scroll-in animation for sections
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('section-visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.2 });
document.querySelectorAll('.section-fade-in').forEach(section => observer.observe(section));

// Function to dynamically load and display portfolio projects
async function loadProjects() {
    try {
        const response = await fetch('data/projects.json');
        const projects = await response.json();
        const portfolioGrid = document.getElementById('portfolio-grid');

        // Render project cards with a single-line description
        projects.forEach(project => {
            const card = document.createElement('div');
            card.classList.add('bg-gray-800', 'p-4', 'rounded-2xl', 'shadow-lg', 'project-card', 'cursor-pointer', 'hover:shadow-brand-secondary/20', 'transition-transform', 'hover:scale-105');
            card.dataset.projectId = project.id;
            card.innerHTML = `
                <div class="h-40 bg-gray-900 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                    <img src="${project.image || 'https://via.placeholder.com/300x200'}" alt="${project.title}" class="w-full h-full object-cover">
                </div>
                <p class="text-text-primary text-sm font-semibold text-center">${project.title}</p>
                <p class="text-text-secondary text-xs text-center mt-1">${project.description.split('.')[0] || 'Web Development'}</p>
            `;
            portfolioGrid.appendChild(card);
        });

        // Event listener for project card clicks to show modal
        const modal = document.getElementById('project-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');

        portfolioGrid.addEventListener('click', (e) => {
            const card = e.target.closest('.project-card');
            if (!card) return;
            const projectId = card.dataset.projectId;
            const project = projects.find(p => p.id === projectId);
            if (!project) return;

            modalTitle.textContent = project.title;
            const techList = project.tech.map(t => `<span class="tech-tag">${t}</span>`).join('');
            modalBody.innerHTML = `
                <p class="text-text-primary font-semibold text-lg mb-2">Role: ${project.role}</p>
                <p class="text-text-secondary mb-4">${project.description}</p>
                <p class="text-text-primary font-semibold mb-2">Tech Used:</p>
                <div class="flex flex-wrap gap-2 mb-4">${techList}</div>
                <img src="${project.image || 'https://via.placeholder.com/300x200'}" class="rounded-lg w-full mb-4">
                ${project.link && project.link !== "#" ? `<p class="mt-2"><a href="${project.link}" target="_blank" class="text-brand-main hover:underline">🔗 Visit Project</a></p>` : ''}
            `;
            modal.classList.remove('hidden');
        });
    } catch (err) {
        console.error("Failed to load projects:", err);
    }
}

// Function to dynamically load and display skills
async function loadSkills() {
    try {
        const response = await fetch('data/skills.json');
        const skillsData = await response.json();
        const skillsContainer = document.getElementById('skills-container');

        skillsData.forEach(category => {
            const skillsHtml = category.skills.map(skill => `
                <div class="flex flex-col items-center text-center w-20">
                    ${skill.logo ? `<img src="${skill.logo}" alt="${skill.name}" class="h-12 w-12 object-contain mb-1">` : `<div class="h-12 w-12 bg-gray-700 rounded-full flex items-center justify-center text-xs p-1">${skill.name}</div>`}
                    <span class="text-text-secondary text-sm">${skill.name}</span>
                </div>
            `).join('');

            const categoryDiv = document.createElement('div');
            categoryDiv.classList.add('mb-8', 'bg-card-bg', 'rounded-2xl', 'overflow-hidden', 'shadow-lg', 'collapsible-section');
            categoryDiv.innerHTML = `
                <button class="w-full text-left px-6 py-4 bg-gray-900 hover:bg-gray-700 flex justify-between items-center focus:outline-none">
                    <h3 class="text-xl font-semibold text-brand-secondary">${category.category}</h3>
                    <span class="accordion-arrow text-text-secondary text-xl">&#9656;</span>
                </button>
                <div class="accordion-content px-6 py-4 hidden">
                    <div class="flex flex-wrap gap-4 justify-start">
                        ${skillsHtml}
                    </div>
                </div>
            `;
            skillsContainer.appendChild(categoryDiv);
        });

        document.querySelectorAll('#skills-container .collapsible-section button').forEach(btn => {
            btn.addEventListener('click', () => {
                const content = btn.nextElementSibling;
                content.classList.toggle('hidden');
                btn.querySelector('.accordion-arrow').innerHTML = content.classList.contains('hidden') ? '&#9656;' : '&#9662;';
            });
        });

    } catch (err) {
        console.error("Failed to load skills:", err);
    }
}

// Function to dynamically load and display work experience as a timeline
async function loadWorkExperience() {
    try {
        const response = await fetch('data/work-experience.json');
        const experiences = await response.json();
        const container = document.getElementById('work-experience-container');

        experiences.forEach((exp, index) => {
            const expDiv = document.createElement('div');
            expDiv.classList.add('relative', 'pb-8', 'timeline-item');
            if (index < experiences.length - 1) {
                const line = document.createElement('div');
                line.classList.add('timeline-line');
                expDiv.appendChild(line);
            }

            const processedDescription = exp.description.map(d => d.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'));

            expDiv.innerHTML += `
                <button class="w-full text-left pl-4 pr-1 py-1 flex items-start justify-between focus:outline-none relative z-10">
                    <span class="flex items-start flex-grow">
                        ${exp.logo ? `<img src="${exp.logo}" alt="${exp.company} Logo" class="h-10 w-10 mr-4 mt-1 object-contain">` : ''}
                        <span class="flex-grow">
                            <span class="font-semibold text-brand-secondary text-lg">${exp.role}</span>
                            <div class="text-text-primary">${exp.company}</div>
                            <div class="text-text-secondary text-sm mt-1">
                                <span>${exp.dates}</span>
                                <span class="mx-2 text-gray-600">•</span>
                                <span>${exp.location}</span>
                            </div>
                        </span>
                    </span>
                    <span class="accordion-arrow text-text-secondary text-xl">&#9656;</span>
                </button>
                <div class="accordion-content pt-2 pl-14 text-text-secondary hidden">
                    <ul class="list-disc list-inside space-y-2 mb-4">
                        ${processedDescription.map(d => `<li class="text-sm leading-relaxed">${d}</li>`).join('')}
                    </ul>
                    ${exp.projects && exp.projects.length ? `<p class="font-semibold text-brand-main mb-2">Projects:</p>
                        <ul class="list-disc list-inside ml-4 space-y-1">
                            ${exp.projects.map(p => `<li><a href="${p.url}" target="_blank" class="text-brand-secondary hover:underline text-sm">${p.name}</a></li>`).join('')}
                        </ul>` : ''}
                </div>
            `;
            container.appendChild(expDiv);
        });

        document.querySelectorAll('#work-experience-container button').forEach(btn => {
            btn.addEventListener('click', () => {
                const content = btn.nextElementSibling;
                content.classList.toggle('hidden');
                btn.querySelector('.accordion-arrow').innerHTML = content.classList.contains('hidden') ? '&#9656;' : '&#9662;';
            });
        });
    } catch (err) {
        console.error("Failed to load work experience:", err);
    }
}

// Handle Formspree submission
const form = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    formStatus.textContent = 'Sending...';
    formStatus.style.color = '#fff';

    const formData = new FormData(form);
    const response = await fetch(form.action, {
        method: form.method,
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    });

    if (response.ok) {
        formStatus.textContent = 'Thank you for your message! I will get back to you shortly.';
        formStatus.style.color = '#38a3a5';
        form.reset();
    } else {
        formStatus.textContent = 'Oops! There was a problem sending your message.';
        formStatus.style.color = '#ef4444';
    }
});

// Initialize all content loading
document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
    loadSkills();
    loadWorkExperience();
});