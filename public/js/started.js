// Auth Modal functionality
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('auth-modal');
    const modalBackdrop = document.getElementById('modal-backdrop');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const switchToRegister = document.getElementById('switch-to-register');
    const switchToLogin = document.getElementById('switch-to-login');

    // Show modal with login form
    function showLoginModal() {
        modal.classList.add('active');
        modalBackdrop.classList.add('active');
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
    }

    // Show modal with register form
    function showRegisterModal() {
        modal.classList.add('active');
        modalBackdrop.classList.add('active');
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
    }

    // Hide modal
    function hideModal() {
        modal.classList.remove('active');
        modalBackdrop.classList.remove('active');
    }

    // Event listeners for nav buttons
    document.querySelectorAll('.nav-login').forEach(btn => {
        btn.addEventListener('click', showLoginModal);
    });

    document.querySelectorAll('.nav-register').forEach(btn => {
        btn.addEventListener('click', showRegisterModal);
    });

    // Close modal when clicking backdrop or X button
    modalBackdrop.addEventListener('click', hideModal);
    document.getElementById('close-modal').addEventListener('click', hideModal);

    // Switch between forms
    if (switchToRegister) {
        switchToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.classList.remove('active');
            registerForm.classList.add('active');
        });
    }

    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            registerForm.classList.remove('active');
            loginForm.classList.add('active');
        });
    }
});
