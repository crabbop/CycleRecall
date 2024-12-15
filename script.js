document.addEventListener("DOMContentLoaded", () => {
    const cardContainer = document.getElementById("card-container");

    // Fetch card data from NetrunnerDB API
    fetch("https://netrunnerdb.com/api/2.0/public/card/34091")
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok " + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            const card = data.data[0]; // Get the card data
            console.log("Card data:", card); // Debugging log
            displayCard(card);
        })
        .catch(error => {
            console.error("Error fetching card:", error);
            cardContainer.innerHTML = "<p>Error loading card. Please try again later.</p>";
        });

    // Display the card on the page
    function displayCard(card) {
        if (!card || !card.imageUrlTemplate || !card.code) {
            console.error("Card data is missing required fields");
            cardContainer.innerHTML = "<p>Error loading card details.</p>";
            return;
        }

        const imageUrl = card.imageUrlTemplate.replace("{code}", card.code) + ".jpg";
        console.log("Image URL:", imageUrl); // Debugging log

        cardContainer.innerHTML = `
            <img src="${imageUrl}" alt="${card.title}" style="max-width: 100%; height: auto;">
            <h2>${card.title}</h2>
        `;

        const fields = [
            { label: "Type", value: card.type_code },
            { label: "Keywords", value: card.keywords },
            { label: "Faction", value: card.faction_code },
            { label: "Cost", value: card.cost },
            { label: "Memory Cost", value: card.memory_cost },
            { label: "Influence Cost", value: card.faction_cost },
            { label: "Description", value: card.text || "No description available." }
        ];

        fields.forEach(field => {
            if (field.value !== null && field.value !== false) {
                cardContainer.innerHTML += `<p><strong>${field.label}:</strong> ${field.value}</p>`;
            }
        });
    }
});
