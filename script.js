// --- Scroll animation for sections ---
const sections = document.querySelectorAll('.section-fade-in');
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('section-visible');
    });
}, { threshold: 0.1 });
sections.forEach(section => observer.observe(section));

// --- Portfolio: Fetch JSON and render cards ---
async function loadProjects() {
    try {
        const response = await fetch('data/projects.json');
        const projects = await response.json();
        const portfolioGrid = document.getElementById('portfolio-grid');

        // Render project cards
        projects.forEach(project => {
            const card = document.createElement('div');
            card.classList.add(
                'bg-gray-800', 'p-4', 'rounded-2xl', 'shadow-lg', 'project-card',
                'cursor-pointer', 'hover:shadow-teal-500/20', 'transition-transform', 'hover:scale-105'
            );
            card.dataset.projectId = project.id;

            card.innerHTML = `
                <div class="h-40 bg-gray-900 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                    <img src="${project.image || 'https://via.placeholder.com/300x200'}" alt="${project.title}" class="w-full h-full object-cover">
                </div>
                <p class="text-slate-300 text-sm font-semibold text-center">${project.title}</p>
            `;

            portfolioGrid.appendChild(card);
        });

        // --- Modal: Event delegation ---
        const modal = document.getElementById('project-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        const closeBtn = document.querySelector('.modal-close');

        portfolioGrid.addEventListener('click', (e) => {
            const card = e.target.closest('.project-card');
            if (!card) return;

            const projectId = card.dataset.projectId;
            const project = projects.find(p => p.id === projectId);
            if (!project) return;

            modalTitle.textContent = project.title;

            const techList = project.tech.map(t => `<li class="inline-block"><span class="tech-tag">${t}</span></li>`).join('');
            modalBody.innerHTML = `
                <p class="text-slate-300 font-semibold text-lg mb-2">Role: ${project.role}</p>
                <p class="text-slate-400 mb-4">${project.description}</p>
                <p class="text-slate-300 font-semibold mb-2">Tech Used:</p>
                <ul class="flex flex-wrap gap-2 mb-4">${techList}</ul>
                <img src="${project.image || 'https://via.placeholder.com/300x200'}" class="rounded-lg w-full mb-4">
                ${project.link && project.link !== "#" ? `<p class="mt-2"><a href="${project.link}" target="_blank" class="text-teal-400 hover:underline">🔗 Visit Project</a></p>` : ''}
            `;

            modal.style.display = 'flex';
        });

        closeBtn.addEventListener('click', () => modal.style.display = 'none');
        window.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });

    } catch (err) {
        console.error("Failed to load projects:", err);
    }
}

// --- Skills: Fetch JSON and render ---
async function loadSkills() {
    try {
        const response = await fetch('data/skills.json');
        const skillsData = await response.json();
        const skillsContainer = document.getElementById('skills-container');

        // Clear existing content
        skillsContainer.innerHTML = '';

        const layoutMap = {
            "Soft Skills & Communication": (skills) => `
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${skills.map(skill => `
                        <div class="flex items-center space-x-3 p-4 bg-gray-800 rounded-lg border border-gray-700">
                            ${skill.logo ? `<img src="${skill.logo}" alt="${skill.name}" class="h-8 w-8 object-contain shrink-0">` : ''}
                            <span class="text-slate-300">${skill.name}</span>
                        </div>
                    `).join('')}
                </div>
            `,
            "Software Architecture & Development Practices": (skills) => `
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${skills.map(skill => `
                        <div class="flex items-center space-x-3 p-4 bg-gray-800 rounded-lg border border-gray-700">
                            ${skill.logo ? `<img src="${skill.logo}" alt="${skill.name}" class="h-8 w-8 object-contain shrink-0">` : ''}
                            <span class="text-slate-300">${skill.name}</span>
                        </div>
                    `).join('')}
                </div>
            `,
            "default": (skills) => `
                <div class="flex flex-wrap gap-4">
                    ${skills.map(skill => `
                        <div class="flex flex-col items-center text-center w-20">
                            <img src="${skill.logo}" alt="${skill.name}" class="h-12 w-12 object-contain mb-1">
                            <span class="text-slate-300 text-sm">${skill.name}</span>
                        </div>
                    `).join('')}
                </div>
            `
        };

        skillsData.forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.classList.add('mb-8', 'bg-gray-800', 'rounded-2xl', 'overflow-hidden', 'shadow-lg', 'collapsible-section');

            const contentIsHidden = false; // Always false to keep all sections open by default

            const layoutFunction = layoutMap[category.category] || layoutMap.default;
            const skillsHtml = layoutFunction(category.skills);

            categoryDiv.innerHTML = `
                <button class="w-full text-left px-6 py-4 bg-gray-900 hover:bg-gray-700 flex justify-between items-center focus:outline-none">
                    <h3 class="text-xl font-semibold text-cyan-400">${category.category}</h3>
                    <span class="accordion-arrow text-slate-300 text-xl">&#9662;</span>
                </button>
                <div class="accordion-content px-6 py-4 text-slate-300 ${contentIsHidden ? 'hidden' : ''}">
                    ${skillsHtml}
                </div>
            `;
            skillsContainer.appendChild(categoryDiv);
        });

        // Accordion toggle for skills
        document.querySelectorAll('#skills-container .collapsible-section button').forEach(btn => {
            btn.addEventListener('click', () => {
                const content = btn.nextElementSibling;
                content.classList.toggle('hidden');
                const arrow = btn.querySelector('.accordion-arrow');
                arrow.innerHTML = content.classList.contains('hidden') ? '&#9656;' : '&#9662;';
            });
        });

    } catch (err) {
        console.error("Failed to load skills:", err);
    }
}


// --- Work Experience: Fetch JSON and render accordion ---
async function loadWorkExperience() {
    try {
        const response = await fetch('data/work-experience.json');
        const experiences = await response.json();
        const container = document.getElementById('work-experience-container');

        experiences.forEach((exp, index) => {
            const expDiv = document.createElement('div');
            expDiv.classList.add('mb-4', 'bg-gray-800', 'rounded-2xl', 'overflow-hidden', 'shadow-lg');

            const isFirst = index === 0;

            // Process the description to replace ** with <strong> tags
            const processedDescription = exp.description.map(d =>
                d.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            );

            expDiv.innerHTML = `
                <button class="w-full text-left px-6 py-4 bg-gray-900 hover:bg-gray-700 flex items-start justify-between focus:outline-none">
                    <span class="flex items-start">
                        ${exp.logo ? `<img src="${exp.logo}" alt="${exp.company} Logo" class="h-12 w-12 mr-4 mt-1 object-contain">` : ''}
                        <span class="flex-grow">
                            <span class="font-semibold text-cyan-400 text-lg">${exp.role}</span>
                            <div class="text-slate-300">${exp.company}</div>
                            <div class="text-slate-400 text-sm mt-1">
                                <span>${exp.dates}</span>
                                <span class="mx-2 text-slate-500">•</span>
                                <span>${exp.location}</span>
                            </div>
                        </span>
                    </span>
                    <span class="accordion-arrow text-slate-300 text-xl">${isFirst ? '&#9662;' : '&#9656;'}</span>
                </button>
                <div class="accordion-content px-6 py-4 text-slate-300 ${!isFirst ? 'hidden' : ''}">
                    <ul class="mb-2 list-disc list-inside space-y-2">
                        ${processedDescription.map(d => `<li class="text-sm leading-relaxed">${d}</li>`).join('')}
                    </ul>
                    ${exp.projects && exp.projects.length ? `<p class="font-semibold text-teal-400 mt-4 mb-2">Projects:</p>
                        <ul class="list-disc list-inside ml-4 space-y-1">
                            ${exp.projects.map(p => `<li><a href="${p.url}" target="_blank" class="text-cyan-400 hover:underline text-sm">${p.name}</a></li>`).join('')}
                        </ul>` : ''}
                </div>
            `;

            container.appendChild(expDiv);
        });

        // Accordion toggle for work experience
        document.querySelectorAll('#work-experience-container button').forEach(btn => {
            btn.addEventListener('click', () => {
                const content = btn.nextElementSibling;
                content.classList.toggle('hidden');
                const arrow = btn.querySelector('.accordion-arrow');
                arrow.innerHTML = content.classList.contains('hidden') ? '&#9656;' : '&#9662;';
            });
        });

    } catch (err) {
        console.error("Failed to load work experience:", err);
    }
}

// --- Initialize all ---
document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
    loadSkills();
    loadWorkExperience();
});