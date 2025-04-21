//const params = new URLSearchParams(window.location.search);
//const code = parseInt(params.get("code")) || 500;
const errorCode = "{{ERROR_CODE}}";
const imageEl = document.getElementById("error-image");
const titleEl = document.getElementById("error-title");
const msgEl = document.getElementById("error-message");

const images = {
    400: "../image/002.png",
    401: "../image/002.png",
    403: "../image/002.png",
    404: "../image/002.png",
    500: "../image/stitch-error.png", 
    504: "../image/002.png",
};

const titles = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Page Not Found",
    500: "Server Error",
    504: "Gateway Timeout",
};

const messages = {
    400: "The request you sent was invalid. Please check your input and try again.",
    401: "You are not authorized to access this page. Please log in or check your credentials.",
    403: "Access to this page is denied. You don’t have the necessary permissions.",
    404: "Sorry, we couldn’t find the page you’re looking for. It might have been moved or deleted.",
    500: "Something went wrong on our end. Our team has been notified, and we’re working to fix it.",
    504: "The operation took longer than expected. Please try again later.",
};

//console.log(`Error code: ${code}`); 
imageEl.src = images[errorCode] || images[500];
titleEl.textContent = titles[errorCode] || "An Unknown Error Occurred";
msgEl.textContent = messages[errorCode] || "Please try again later.";
