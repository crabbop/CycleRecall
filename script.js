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
            displayCard(card);
        })
        .catch(error => {
            console.error("Error fetching card:", error);
            cardContainer.innerHTML = "<p>Error loading card. Please try again later.</p>";
        });

    // Display the card on the page
    function displayCard(card) {
        const imageUrl = card.image_url || "https://via.placeholder.com/300x400?text=No+Image";

        cardContainer.innerHTML = `
            <img src="${imageUrl}" alt="${card.title}" style="max-width: 100%; height: auto;">
            <h2>${card.title}</h2>
            <p><strong>Type:</strong> ${card.type_code}</p>
            <p><strong>Faction:</strong> ${card.faction_code}</p>
            <p><strong>Cost:</strong> ${card.cost || "N/A"}</p>
            <p><strong>Strength:</strong> ${card.strength || "N/A"}</p>
            <p><strong>Memory Units:</strong> ${card.memory_units || "N/A"}</p>
            <p><strong>Agenda Points:</strong> ${card.agenda_points || "N/A"}</p>
            <p><strong>Influence Cost:</strong> ${card.faction_cost || "N/A"}</p>
            <p><strong>Console Power:</strong> ${card.console_power || "N/A"}</p>
            <p><strong>Description:</strong> ${card.text || "No description available."}</p>
        `;
    }
});
