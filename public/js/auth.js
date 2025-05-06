/*
const selectAuth = document.querySelector('meta[name="select-auth"]')?.getAttribute('content') || "register";

function showSection(section) {
  const sections = ['register', 'login', 'reset'];
  const buttons = document.querySelectorAll('.auth-circle');

  sections.forEach(id => {
    const el = document.getElementById(`${id}-section`);
    if (id === section) {
      el.style.display = 'block';
      setTimeout(() => el.classList.add('active'), 10);
    } else {
      el.classList.remove('active');
      setTimeout(() => el.style.display = 'none', 400);
    }
  });

  buttons.forEach((btn, index) => {
    btn.classList.toggle('active', sections[index] === section);
  });
}

document.addEventListener('DOMContentLoaded', () => showSection(selectAuth));

if (window.location.search.includes("page=")) {
          const newUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        }

        */
