
const themeToggle = document.querySelector('.theme-toggle');

const bottomNavToggle = document.querySelector('.bottom-nav-toggle');
const bottomSheet = document.querySelector('.bottom-sheet');
const bottomNav = document.querySelector('.bottom-nav');

const body = document.body;


themeToggle.addEventListener('click', () => {
  const currentTheme = body.getAttribute('data-theme');
  if (currentTheme === 'light') {
    body.setAttribute('data-theme', 'dark');
  } else {
    body.setAttribute('data-theme', 'light');
  }
});



bottomNavToggle.addEventListener('click', () => {
  const isHidden = bottomSheet.style.display === 'none' || bottomSheet.style.display === '';
  if (isHidden) {
    bottomSheet.style.display = 'block';
    bottomNav.style.display = 'block';
  } else {
    bottomSheet.style.display = 'none';
    bottomNav.style.display = 'none';
  }
});
