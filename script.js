document.addEventListener("DOMContentLoaded", () => {
    const cardContainer = document.getElementById("card-container");
    const questionContainer = document.getElementById("question-container");

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
            const display_card = getRandomCard(startupCards); // Get a random card and store it as display_card
            displayCard(display_card);
            chooseThreeRandomCards(display_card, startupCards); // Call the new function
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
    function displayCard(display_card) {
        if (!display_card) {
            console.error("Card data is missing");
            cardContainer.innerHTML = "<p>Error loading card details.</p>";
            return;
        }

        const imageUrl = `https://card-images.netrunnerdb.com/v2/large/${display_card.code}.jpg`;

        const fields = getFields(display_card).map(field => {
            let value = display_card[field];
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

        cardContainer.innerHTML = `
            <div class="card-content">
                <div class="card-image-container"></div>
                <div class="card-details">
                    ${fields}
                </div>
            </div>`;
        cardContainer.querySelector(".card-image-container").appendChild(cardImage);
    }

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

    // New function to choose 3 random cards
    function chooseThreeRandomCards(display_card, cards) {
        // Get the type_code of the display_card
        const typeCode = display_card.type_code;
        console.log("Type code of display_card:", typeCode);

        // Filter cards with the same type_code and pack_code as 'rwr', 'tai', 'su21', 'sg'
        const filteredCards = cards.filter(card => card.type_code === typeCode);
        console.log("Filtered cards:", filteredCards);

        // Select 3 random cards from the filtered list
        const randomCards = [];
        while (randomCards.length < 3 && filteredCards.length > 0) {
            const randomIndex = Math.floor(Math.random() * filteredCards.length);
            randomCards.push(filteredCards.splice(randomIndex, 1)[0]);
        }
        console.log("Selected random cards:", randomCards);

        // Print the titles of the 3 random cards into the question-container
        if (questionContainer) {
            questionContainer.innerHTML = `<p>${display_card.title}</p>` + randomCards.map(card => `<p>${card.title}</p>`).join('');

            // Add buttons to the question-container
            const buttonContainer = document.createElement("div");
            buttonContainer.className = "button-container";

            randomCards.forEach((card, index) => {
                const button = document.createElement("button");
                button.innerText = `Card ${index + 1}`;
                button.addEventListener("click", () => {
                    alert(`You clicked: ${card.title}`);
                });
                buttonContainer.appendChild(button);
            });

            questionContainer.appendChild(buttonContainer);
        } else {
            console.error("question-container element not found");
        }
    }
});
