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
function displayCard(card) {
    if (!card) {
        console.error("Card data is missing");
        cardContainer.innerHTML = "<p>Error loading card details.</p>";
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

    const svgContainer = document.createElement('div');
    svgContainer.className = 'svg-container';

    // Create and add the SVG image element to the container only if needed
    const img = document.createElement('img');
    img.src = 'svg/mu.svg'; // Example SVG file
    img.alt = 'mu';
    img.className = 'icon';

    svgContainer.appendChild(img);

    const cardImage = new Image();
    cardImage.src = imageUrl;
    cardImage.alt = "Card Image";
    cardImage.className = "card-image";

    cardContainer.innerHTML = `
        <div class="card-content">
            <div class="card-image-container"></div>
            <div class="card-details">
                ${fields}
            </div>
        </div>`;
    cardContainer.querySelector(".card-image-container").appendChild(cardImage);
    cardContainer.querySelector(".card-image-container").appendChild(svgContainer);
}

    // Function to format card text
    function formatCardText(text) {
        const replacements = {
            '\\[trash\\]': 'trash.svg',
            '\\[mu\\]': 'mu.svg',
            '\\[click\\]': 'click.svg',
            '\\[credit\\]': 'credit.svg',
            '\\[subroutine\\]': 'subroutine.svg',
            '\\[recurring-credit\\]': 'recurring-credit.svg'
        };

        for (const [key, value] of Object.entries(replacements)) {
            const iconClass = `icon-${key.slice(2, -2)}`;
            const regex = new RegExp(key, 'g');
            text = text.replace(regex, `<img src="svg/${value}" alt="${key.slice(2, -2)}" class="icon ${iconClass}">`);
        }

        // Handle line breaks
        text = text.replace(/\n/g, '<br>');

        return text;
    }
});
