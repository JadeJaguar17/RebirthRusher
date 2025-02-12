/**
 * @typedef {import("../../RebirthRusher.js")} RebirthRusher
 * @typedef {import("eris").Message} Message 
 */

const UserDB = require("../../database/controllers/userController");
const Timer = require("../../system/Timer");

module.exports.name = "fish"

/**
 * Starts fish timer
 * @param {RebirthRusher} bot instance of RbR base class
 * @param {Message} message triggering Discord message
 * @param {string} userID user's Discord ID
 */
module.exports.execute = async function (bot, message, userID) {
    const user = await UserDB.getUserById(userID);
    const fishcd = user?.settings.fishingPerks === 3
        ? 240
        : 300
    if (user?.timers.games.fish === "ready") {
        await new Timer(
            bot,
            message,
            userID,
            "fish",
            "games",
            fishcd
        ).start();
    }
}
