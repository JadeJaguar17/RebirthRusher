/**
 * @typedef {import("../../RebirthRusher.js")} RebirthRusher
 * @typedef {import("eris").Message} Message 
 */

const UserDB = require("../../database/controllers/userController");
const Timer = require("../../system/Timer");

module.exports.name = "hunt"
module.exports.aliases = ["h"]

/**
 * Starts earthquake timer
 * @param {RebirthRusher} bot instance of RbR base class
 * @param {Message} message triggering Discord message
 * @param {string} userID user's Discord ID
 */
module.exports.execute = async function (bot, message, userID) {
    const user = await UserDB.getUserById(userID);

    if (user?.timers.games.hunt === "ready") {
        await new Timer().startTimer(
            message,
            userID,
            "hunt",
            "games",
            user.settings.huntcd
        );
    }
}
