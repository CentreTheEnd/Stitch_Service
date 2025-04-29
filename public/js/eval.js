async function executeCode() {
  const code = document.getElementById('codeInput').value;

  // إرسال الكود إلى السيرفر عبر POST
  const response = await fetch('/api/v3/eval', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code })
  });

  const data = await response.json();

  // عرض النتيجة أو الخطأ
  document.getElementById('result').textContent = data.result || '';
  document.getElementById('error').textContent = data.error || '';
}
