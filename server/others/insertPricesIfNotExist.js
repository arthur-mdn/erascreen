const Price = require("../models/Price");

async function insertPricesIfNotExist() {
    try {
        const pricesToInsert = [
            {
                title: "1 voyage Terrestre",
                type: "terrestre",
                multiple: 1,
                maxUse: 1,
                maxTime: "1 hour",
                price: 1.4,
                description: "- Pour tous\n- Occasionnellement\nAstuce! En achetant un titre de 10 voyages, j'économise 4€",
                image: "/1voyageterrestre.png",
                status: "ok"
            },
            {
                title: "1 voyage Maritime",
                type: "maritime",
                multiple: 1,
                maxUse: 1,
                maxTime: "1 hour",
                price: 2,
                description: "- Pour tous\n- Occasionnellement\nAstuce! En achetant un titre de 10 voyages, j'économise 4€",
                image: "/1voyagemaritime.png",
                status: "ok"
            },
            {
                title: "10 voyages",
                type: "terrestre",
                multiple: 10,
                maxUse: 1,
                maxTime: "1 hour",
                price: 10,
                description: "- Pour tous\n- Occasionnellement\nNombre de voyage : 10",
                image: "/10voyages.png",
                status: "ok"
            }
        ];

        for (const price of pricesToInsert) {
            const existingPrice = await Price.findOne({ title: price.title });
            if (!existingPrice) {
                console.log("création price: " + price.title)
                await Price.create(price);
            }else{
                console.log("price déjà existant: " + price.title)            }
        }
        console.log("Prices inserted into the database.");
    } catch (error) {
        console.error("Error inserting prices into the database: " + error);
    }
}

module.exports = insertPricesIfNotExist;