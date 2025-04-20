document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    const savedTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
    function updateThemeIcon(theme) {
        const icon = themeToggle.querySelector('i');
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const menuBackdrop = document.querySelector('.menu-backdrop');
    const body = document.body;
    function toggleMenu() {
        const isOpen = navLinks.classList.toggle('active');
        menuToggle.classList.toggle('active', isOpen);
        if (menuBackdrop) {
            menuBackdrop.classList.toggle('active', isOpen);
        }
        body.classList.toggle('menu-open', isOpen);
        // Removed direct style manipulation - will be handled by CSS
    }
    menuToggle.addEventListener('click', toggleMenu);
    if (menuBackdrop) {
        menuBackdrop.addEventListener('click', toggleMenu);
    }
    document.querySelectorAll('.nav-links a:not(.btn)').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                toggleMenu();
            }
        });
    });
});
