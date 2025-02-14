/**
 * @typedef {import("../../RebirthRusher.js")} RebirthRusher
 * @typedef {import("eris").Message} Message 
 */

const UserDB = require("../../database/controllers/userController");
const Timer = require("../../system/Timer");

const pKitCooldowns = [86400, 86400, 86400, 72000, 54000, 36000];

module.exports.name = "prestigekit"
module.exports.aliases = ["pkit", "pk"]

/**
 * Starts prestige kit timer
 * @param {RebirthRusher} bot RbR Discord client
 * @param {Message} message triggering Discord message
 * @param {string} userID user's Discord ID
 * @returns {Promise<void>}
 */
module.exports.execute = async function (bot, message, userID) {
    const user = await UserDB.getUserById(userID);

    if (user.timers.kits.pKit === "ready") {
        await new Timer(
            bot,
            message,
            userID,
            "prestigekit",
            "kits",
            pKitCooldowns[user.settings.pKit]
        ).start();
    }
}
