/**
 * @typedef {import("../../RebirthRusher.js")} RebirthRusher
 * @typedef {import("eris").Message} Message 
 */

const UserDB = require("../../database/controllers/userController");
const Timer = require("../../system/Timer");

module.exports.name = "hourly"
module.exports.aliases = ["hr"]

/**
 * Starts hourly timer
 * @param {RebirthRusher} bot instance of RbR base class
 * @param {Message} message triggering Discord message
 * @param {string} userID user's Discord ID
 */
module.exports.execute = async function (bot, message, userID) {
    const user = await UserDB.getUserById(userID);

    if (user.timers.kits.hourly === "ready") {
        await new Timer(
            bot,
            message,
            userID,
            "hourly",
            "kits",
            3600
        ).start();
    }
}
