/* ============================================================
   LANDING PAGE – main.js
   ============================================================ */

// Header scroll effect
const header = document.getElementById('main-header');
if (header) {
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 60);
    });
}

// Feature Tabs
const featTabs = document.querySelectorAll('.feat-tab');
const featPanels = document.querySelectorAll('.feat-panel');
featTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const target = tab.dataset.target;
        featTabs.forEach(t => t.classList.remove('active'));
        featPanels.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        const panel = document.getElementById(target);
        if (panel) panel.classList.add('active');
    });
});

// Chart tabs on landing page (decorative)
document.querySelectorAll('.chart-tab').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.chart-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// Smooth anchor scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});
