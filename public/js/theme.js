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
    const year = new Date().getFullYear();
    const element = document.querySelector('.copyright p');
    
    if (element) {
       element.textContent = `© 2020 - ${year} Stitch Service.`;
       element.style.cursor = 'pointer';
       
        element.addEventListener('click', () => {
          window.location.href = '/about';
    });
    }


    function toggleMenu() {
        const isOpen = navLinks.classList.toggle('active');
        menuToggle.classList.toggle('active', isOpen);
        if (menuBackdrop) {
            menuBackdrop.classList.toggle('active', isOpen);
        }
        body.classList.toggle('menu-open', isOpen);
    }

    menuToggle.addEventListener('click', toggleMenu);
    if (menuBackdrop) {
        menuBackdrop.addEventListener('click', toggleMenu);
    }

    // تعديل لتشمل جميع الروابط بما في ذلك الأزرار
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                toggleMenu();
            }
        });
    });
});
