const users = require("../models/userModel");

module.exports = {
    name: "petScan",
    execute: async function (embed, userID) {
        const user = await users.findById(userID);
        user.pets.shards = Number(embed.description.split("\n")[2].split(" ")[2].replace(/,/g, ''));

        for (const pet of Object.keys(user.pets)) {
            if (pet !== "shards") {
                user.pets[pet] = 0;
            }
        }

        embed.fields && embed.fields.forEach(field => {
            const rarity = field.name.trim().split("**")[1].toLowerCase();
            const pets = field.value.trim().split("\n");

            if (["common", "uncommon", "rare", "epic"].includes(rarity)) {
                pets.forEach(pet => {
                    if (!pet.includes("Max. level:")) {
                        const petLevel = pet.includes("★")
                            ? Number(pet.split(" ")[4].replace("]", '').trim())
                            : Number(pet.split(" ")[3].replace("]", '').trim());

                        const db = (pet.includes("★") && `★ ${rarity}`) || rarity;
                        user.pets[db] += petLevel;
                    }
                });
            } else if (rarity === "mythical") {
                pets.forEach(pet => {
                    if (!pet.includes("Max. level:")) {
                        const petName = (pet.split(" ")[(pet.includes("★") && 2) || 1].split("**")[1].trim()).toLowerCase();
                        const petLevel = Number(pet.split(" ")[(pet.includes("★") && 4) || 3].replace("]", '').trim()) * ((pet.includes("★") && 2) || 1);

                        if (user.pets[petName] >= 0) {
                            user.pets[petName] = petLevel;
                        }
                    }
                });
            } else if (rarity === "legendary") {
                pets.forEach(pet => {
                    if (!pet.includes("Max. level:")) {
                        const petName = (pet.split(" ")[(pet.includes("★") && 2) || 1].split("**")[1].trim()).toLowerCase();
                        const petLevel = Number(pet.split(" ")[(pet.includes("★") && 4) || 3].replace("]", '').trim());

                        if (user.pets[petName] >= 0) {
                            user.pets[petName] = petLevel;
                        }
                    }
                });
            }
        });

        await user.save();
    }
}
