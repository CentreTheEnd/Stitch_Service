function flipTo(mode) {
  const card = document.getElementById('authCard');
  const reset = document.getElementById('resetForm');
  reset.style.display = 'none';

  if (mode === 'login') {
    card.classList.remove('signup');
    card.classList.add('login');
  } else if (mode === 'signup') {
    card.classList.remove('login');
    card.classList.add('signup');
  }
}

function showReset() {
  document.getElementById('resetForm').style.display = 'block';
  document.getElementById('authCard').style.display = 'none';
}

function hideReset() {
  document.getElementById('resetForm').style.display = 'none';
  document.getElementById('authCard').style.display = 'block';
}
