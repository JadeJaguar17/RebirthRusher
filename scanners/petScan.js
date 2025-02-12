/**
 * @typedef {import("../RebirthRusher.js")} RebirthRusher
 * @typedef {import("../system/MessageEmbed.js")} MessageEmbed
 */

const UserDB = require("../database/controllers/userController");
const MessageEmbed = require("../system/MessageEmbed.js");

module.exports.name = "petScan"

/**
 * Scans user's pets and updates stats
 * @param {RebirthRusher} bot instance of RbR base class
 * @param {MessageEmbed} embed Idle Miner /pets embed
 * @param {string} userID user's Discord ID
 */
module.exports.execute = async function (bot, embed, userID) {
    const user = await UserDB.getUserById(userID);
    user.pets.shards = Number(embed.description.split("\n")[2].split(" ")[2].replace(/,/g, ''));

    Object.keys(user.pets).forEach(pet => {
        if (pet !== "shards") {
            user.pets[pet] = 0;
        }
    });

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
