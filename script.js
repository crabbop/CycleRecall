document.addEventListener("DOMContentLoaded", () => {
    const cardContainer = document.getElementById("card-container");

    // Fetch the list of cards from NetrunnerDB API
    fetch("https://netrunnerdb.com/api/2.0/public/cards")
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok " + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            const cards = data.data; // Get the list of cards
            const startupPackCodes = ['rwr', 'tai', 'su21', 'sg']; // Startup format pack codes
            const startupCards = cards.filter(card => startupPackCodes.includes(card.pack_code)); // Filter cards for the startup format
            const randomCard = getRandomCard(startupCards); // Get a random card
            displayCard(randomCard);
        })
        .catch(error => {
            console.error("Error fetching cards:", error);
            cardContainer.innerHTML = "<p>Error loading cards. Please try again later.</p>";
        });

    // Function to get a random card from a list of cards
    function getRandomCard(cards) {
        const randomIndex = Math.floor(Math.random() * cards.length);
        return cards[randomIndex];
    }

    // Function to get fields based on type_code
    function getFields(card) {
        const fieldSets = {
            "agenda": ["title", "type_code", "keywords", "faction_code", "advancement_cost", "cost", "text"],
            "asset": ["title", "type_code", "keywords", "faction_code", "cost", "text", "trash_cost"],
            "operation": ["title", "type_code", "keywords", "faction_code", "cost", "trash_cost", "text"],
            "upgrade": ["title", "type_code", "keywords", "faction_code", "cost", "trash_cost", "text"],
            "ice": ["title", "type_code", "keywords", "faction_code", "cost", "strength", "text"],
            "identity": ["title", "type_code", "keywords", "faction_code", "minimum_deck_size", "influence_limit", "text"],
            "event": ["title", "type_code", "faction_code", "cost", "text"],
            "program": ["title", "type_code", "keywords", "faction_code", "cost", "memory_cost", "text"],
            "hardware": ["title", "type_code", "keywords", "faction_code", "cost", "text"],
            "resource": ["title", "type_code", "keywords", "faction_code", "cost", "text"]
        };

        return fieldSets[card.type_code] || [];
    }

    // Display the card on the page
function displayCard(card, container) {
    if (!card) {
        console.error("Card data is missing");
        container.innerHTML = "<p>Error loading card details.</p>";
        return;
    }

    const imageUrl = `https://card-images.netrunnerdb.com/v2/large/${card.code}.jpg`;

    const fields = getFields(card).map(field => {
        let value = card[field];
        if (field === "faction_code") {
            value = value && value.toLowerCase() === 'nbn' ? value.toUpperCase() : value.charAt(0).toUpperCase() + value.slice(1);
        } else {
            value = value && typeof value === 'string' ? value.charAt(0).toUpperCase() + value.slice(1) : value;
        }

        if (field === 'text') {
            value = formatCardText(value);
        }

        let fieldHtml = `<p><strong>${field.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}:</strong>`;
        if (field === 'text') {
            fieldHtml += `<br>${value}</p>`;
        } else {
            fieldHtml += ` ${value}</p>`;
        }
        return fieldHtml;
    }).join('');

    const cardImage = new Image();
    cardImage.src = imageUrl;
    cardImage.alt = "Card Image";
    cardImage.className = "card-image";

    container.innerHTML = `
        <div class="card-content">
            <div class="card-image-container"></div>
            <div class="card-details">
                ${fields}
            </div>
        </div>`;
    container.querySelector(".card-image-container").appendChild(cardImage);
}

// Function to get 3 random cards with the same type_code
function getRandomCardsWithSameType(cards, type_code, excludeCode) {
    const filteredCards = cards.filter(card => card.type_code === type_code && card.code !== excludeCode);
    const shuffledCards = filteredCards.sort(() => 0.5 - Math.random());
    return shuffledCards.slice(0, 3);
}

// Main function to select a random card and 3 additional cards
function displayRandomCardWithQuestions(cards) {
    if (cards.length === 0) {
        console.error("No cards available");
        return;
    }

    // Select a random card
    const randomCard = cards[Math.floor(Math.random() * cards.length)];

    // Display the random card in the main card container
    displayCard(randomCard, document.getElementById('card-container'));

    // Get 3 random cards with the same type_code
    const questionCards = getRandomCardsWithSameType(cards, randomCard.type_code, randomCard.code);

    // Display the chosen card and the 3 additional cards in the question container
    const questionContainer = document.getElementById('question-container');
    questionContainer.innerHTML = ''; // Clear previous content

    questionCards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'question-card';
        displayCard(card, cardElement);
        questionContainer.appendChild(cardElement);
    });
}

// Assume `cards` is an array of card objects available in your script
// Call the function to display a random card and 3 additional cards
displayRandomCardWithQuestions(cards);

    // Function to format card text
function formatCardText(text) {
    const replacements = {
        '\\[trash\\]': { file: 'trash.svg', width: '20px', height: '20px' },
        '\\[mu\\]': { file: 'mu.svg', width: '20px', height: '20px' },
        '\\[click\\]': { file: 'click.svg', width: '20px', height: '20px' },
        '\\[credit\\]': { file: 'credit.svg', width: '20px', height: '20px' },
        '\\[subroutine\\]': { file: 'subroutine.svg', width: '20px', height: '20px' },
        '\\[recurring-credit\\]': { file: 'recurring-credit.svg', width: '20px', height: '20px' }
    };

    for (const [key, value] of Object.entries(replacements)) {
        const iconClass = `icon-${key.slice(2, -2)}`;
        const regex = new RegExp(key, 'g');
        text = text.replace(regex, `<img src="svg/${value.file}" alt="${key.slice(2, -2)}" class="icon ${iconClass}" style="width: ${value.width}; height: ${value.height};">`);
    }

    // Handle line breaks
    text = text.replace(/\n/g, '<br>');

    return text;
}
});
