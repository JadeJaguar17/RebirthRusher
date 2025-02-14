/**
 * @typedef {import("../RebirthRusher.js")} RebirthRusher
 * @typedef {import("eris").Message} Message
 */

const UserDB = require("../database/controllers/userController");
const Timer = require("../system/Timer");

module.exports.name = "kits"

/**
 * Scans cooldowns from Idle Miner /kits
 * @param {RebirthRusher} bot RbR Discord client
 * @param {Message} message triggering Discord message
 * @param {string} userID user's Discord ID
 * @returns {Promise<void>}
 */
module.exports.execute = async function (bot, message, userID) {
    const user = await UserDB.getUserById(userID);

    for (const field of message.embeds[0].fields) {
        const category = field.name.split("**")[1].toLowerCase();

        for (const line of field.value.split("\n")) {
            try {
                const name = line.split(" ")[1].split("**")[1].toLowerCase();
                const time = bot.stringToTime(line.split(" ")[3]);

                if (user.timers[category][name] === "ready" && Number.isInteger(time) && name !== "daily") {
                    await new Timer(bot, message, userID, name, category, time).start();
                }
            } catch (error) { }
        }
    }
}
