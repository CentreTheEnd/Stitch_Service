document.getElementById('executeBtn').addEventListener('click', async () => {
  const code = document.getElementById('code').value;
  const outputDiv = document.getElementById('output');

  outputDiv.textContent = 'Executing...';

  try {
    const res = await fetch('/api/v3/eval', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });

    const data = await res.json();
    if (data.error) {
      outputDiv.textContent = `Error:\n${data.error}`;
    } else {
      outputDiv.textContent = `Result:\n${data.result}`;
    }
  } catch (err) {
    outputDiv.textContent = 'Server error.';
  }
});
