// script.js

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
        cardContainer.innerHTML = `
            <img src="${card.image_url}" alt="${card.title}" style="max-width: 100%; height: auto;">
            <h2>${card.title}</h2>
            <p><strong>Type:</strong> ${card.type_code}</p>
            <p><strong>Text:</strong> ${card.text}</p>
        `;
    }
});
