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

// NEW FUNCTION: Attaches listeners to the (now static) accordions.
function initAccordionListeners() {
    // Skills Accordion Logic
    document.querySelectorAll('#skills-container .collapsible-section button').forEach(btn => {
        btn.addEventListener('click', () => {
            const content = btn.nextElementSibling;
            const arrow = btn.querySelector('.accordion-arrow');
            content.classList.toggle('hidden');
            arrow.classList.toggle('rotate-45');
        });
    });

    // Work Experience Accordion Logic
    document.querySelectorAll('#work-experience-container button').forEach(btn => {
        btn.addEventListener('click', () => {
            const content = btn.nextElementSibling;
            const arrow = btn.querySelector('.accordion-arrow');
            content.classList.toggle('hidden');
            arrow.classList.toggle('rotate-45');
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

// Updated DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    initProjectModalLogic(); // Loads JSON data for modals
    initAccordionListeners(); // Attaches listeners to static accordions
});