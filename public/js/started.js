// Toggle the menu for mobile view
const menuIcon = document.querySelector('.menu-icon');
const navLinks = document.querySelector('.nav-links');

menuIcon.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Active link toggle in navbar
const navItems = document.querySelectorAll('.nav-links a');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        // Remove active class from all items
        navItems.forEach(link => link.classList.remove('active'));
        // Add active class to the clicked item
        item.classList.add('active');
    });
});

// Content for the cards, this can be dynamically inserted into the page
const cardData = [
    {
        imgSrc: 'https://via.placeholder.com/300',
        title: 'API Integration',
        description: 'Easily integrate our API into your projects with detailed documentation and support.'
    },
    {
        imgSrc: 'https://via.placeholder.com/300',
        title: 'Fast Response Time',
        description: 'Get fast and reliable responses from our API to ensure smooth operation.'
    },
    {
        imgSrc: 'https://via.placeholder.com/300',
        title: 'Customizable Endpoints',
        description: 'Customize API endpoints based on your project requirements for a tailored experience.'
    }
];

// Function to create card elements dynamically
function createCards() {
    const cardsContainer = document.querySelector('.cards-side');
    cardData.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        
        const img = document.createElement('img');
        img.src = card.imgSrc;
        img.alt = card.title;

        const title = document.createElement('h3');
        title.innerText = card.title;

        const description = document.createElement('p');
        description.innerText = card.description;

        cardElement.appendChild(img);
        cardElement.appendChild(title);
        cardElement.appendChild(description);

        cardsContainer.appendChild(cardElement);
    });
}

// Initialize the page by creating cards
createCards();

// For features section, dynamic generation of content
const advantagesData = [
    {
        icon: '⚡', // Replace with your preferred Google icon if you want
        title: 'Fast API',
        description: 'Experience lightning-fast responses for all your API requests.'
    },
    {
        icon: '🌍', // Replace with your preferred Google icon if you want
        title: 'Global Access',
        description: 'Our API is accessible globally, ensuring seamless integration.'
    },
    {
        icon: '🔒', // Replace with your preferred Google icon if you want
        title: 'Secure',
        description: 'Security is our priority, protecting your data and requests.'
    }
];

// Function to create advantage boxes dynamically
function createAdvantages() {
    const advantagesContainer = document.querySelector('.advantages-grid');
    advantagesData.forEach(advantage => {
        const advantageBox = document.createElement('div');
        advantageBox.classList.add('advantage-box');

        const icon = document.createElement('div');
        icon.classList.add('icon');
        icon.innerHTML = advantage.icon;

        const title = document.createElement('h3');
        title.innerText = advantage.title;

        const description = document.createElement('p');
        description.innerText = advantage.description;

        advantageBox.appendChild(icon);
        advantageBox.appendChild(title);
        advantageBox.appendChild(description);

        advantagesContainer.appendChild(advantageBox);
    });
}

// Initialize the advantages section
createAdvantages();
