const params = new URLSearchParams(window.location.search);
const code = parseInt(params.get("code")) || 500;

const iconEl = document.getElementById("error-icon");
const titleEl = document.getElementById("error-title");
const msgEl = document.getElementById("error-message");

const icons = {
  400: `<svg fill="#f44336" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.373 0 12c0 6.627 5.37 12 12 12s12-5.373 12-12C24 5.373 18.63 0 12 0zM13 17h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>`,
  401: `<svg fill="#f44336" viewBox="0 0 24 24"><path d="M11 15h2v2h-2zm0-10h2v8h-2zm1-5C5.48 0 0 5.48 0 12s5.48 12 12 12 12-5.48 12-12S18.52 0 12 0z"/></svg>`,
  403: `<svg fill="#f44336" viewBox="0 0 24 24"><path d="M12 20c4.418 0 8-3.582 8-8h2c0 5.523-4.477 10-10 10S2 17.523 2 12h2c0 4.418 3.582 8 8 8zm0-16c-1.1 0-2 .9-2 2v4h2V6h2V4h-2zm-1 10h2v2h-2z"/></svg>`,
  404: `<svg fill="#f44336" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.373 0 12c0 6.627 5.37 12 12 12s12-5.373 12-12C24 5.373 18.63 0 12 0zM13 17h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>`,
  500: `<svg fill="#f44336" viewBox="0 0 24 24"><path d="M11 15h2v2h-2zm0-10h2v8h-2zm1-5C5.48 0 0 5.48 0 12s5.48 12 12 12 12-5.48 12-12S18.52 0 12 0z"/></svg>`,
  504: `<svg fill="#f44336" viewBox="0 0 24 24"><path d="M12 20c4.418 0 8-3.582 8-8h2c0 5.523-4.477 10-10 10S2 17.523 2 12h2c0 4.418 3.582 8 8 8zm0-16c-1.1 0-2 .9-2 2v4h2V6h2V4h-2zm-1 10h2v2h-2z"/></svg>`,
};

const titles = {
  400: "طلب غير صالح",
  401: "غير مصرح به",
  403: "ممنوع",
  404: "الصفحة غير موجودة",
  500: "خطأ في الخادم",
  504: "انتهت المهلة",
};

const messages = {
  400: "الطلب الذي أرسلته غير صالح.",
  401: "أنت غير مصرح لك بالوصول إلى هذه الصفحة.",
  403: "تم رفض الوصول إلى هذه الصفحة.",
  404: "عذرًا، لا يمكننا العثور على الصفحة التي تبحث عنها.",
  500: "حدث خلل أثناء معالجة الطلب.",
  504: "استغرقت العملية وقتًا أطول من المتوقع.",
};

iconEl.innerHTML = icons[code] || icons[500];
titleEl.textContent = titles[code] || "حدث خطأ غير معروف";
msgEl.textContent = messages[code] || "نرجو المحاولة لاحقًا.";
