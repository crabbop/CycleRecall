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

        const imageUrl = `https://netrunnerdb.com/card_image/${card.code}.png?${new Date().getTime()}`;

        const fields = getFields(card).map(field => {
            let value = card[field];
            if (field === "faction_code") {
                value = value && value.toLowerCase() === 'nbn' ? value.toUpperCase() : value.charAt(0).toUpperCase() + value.slice(1);
            } else {
                value = value && typeof value === 'string' ? value.charAt(0).toUpperCase() + value.slice(1) : value;
            }
            return { label: field.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase()), value };
        });

        const img = new Image();
        img.src = imageUrl;
        img.alt = "Card Image";
        img.className = "card-image";

        img.onerror = (event) => {
            console.error(`Error loading card image: ${event.message}`);
            img.src = "default-image.png"; // Fallback image
        };

        cardContainer.innerHTML = `
            <div class="card-content">
                <div class="card-image-container"></div>
                <div class="card-details">
                    ${fields.map(field => field.value !== null && field.value !== false ? `<p><strong>${field.label}:</strong> ${field.value}</p>` : '').join('')}
                </div>
            </div>`;
        cardContainer.querySelector(".card-image-container").appendChild(img);
    }
});
