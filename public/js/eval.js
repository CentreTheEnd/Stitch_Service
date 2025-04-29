function runCode() {
  const code = document.getElementById('code').value;
  const resultElement = document.getElementById('result');

  fetch('/api/v3/eval', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      resultElement.textContent = `Result:\n${data.result}`;
    } else {
      resultElement.textContent = `Error:\n${data.error}`;
    }
  })
  .catch(err => {
    resultElement.textContent = `Fetch Error:\n${err.message}`;
  });
}
