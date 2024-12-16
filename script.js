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

    // Display the card on the page
    function displayCard(card) {
        if (!card) {
            console.error("Card data is missing");
            cardContainer.innerHTML = "<p>Error loading card details.</p>";
            return;
        }

        const imageUrl = `https://netrunnerdb.com/card_image/${card.code}.png`;

        const fields = [
            { label: "Type", value: card.type_code },
            { label: "Keywords", value: card.keywords },
            { label: "Faction", value: card.faction_code },
            { label: "Cost", value: card.cost },
            { label: "Memory Cost", value: card.memory_cost },
            { label: "Influence Cost", value: card.faction_cost },
            { label: "Description", value: card.text || "No description available." }
        ];

        cardContainer.innerHTML = `
            <div class="card-content">
                <img src="${imageUrl}" alt="Card Image" class="card-image">
                <div class="card-details">
                    ${fields.map(field => field.value !== null && field.value !== false ? `<p><strong>${field.label}:</strong> ${field.value}</p>` : '').join('')}
                </div>
            </div>`;
    }
});
