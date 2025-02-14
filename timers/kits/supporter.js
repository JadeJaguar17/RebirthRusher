/**
 * @typedef {import("../../RebirthRusher.js")} RebirthRusher
 * @typedef {import("eris").Message} Message 
 */

const UserDB = require("../../database/controllers/userController");
const Timer = require("../../system/Timer");

module.exports.name = "supporter"
module.exports.aliases = ["sup", "support"]

/**
 * Starts supporter timer
 * @param {RebirthRusher} bot RbR Discord client
 * @param {Message} message triggering Discord message
 * @param {string} userID user's Discord ID
 */
module.exports.execute = async function (bot, message, userID) {
    const user = await UserDB.getUserById(userID);

    if (user.timers.kits.supporter === "ready") {
        await new Timer(
            bot,
            message,
            userID,
            "supporter",
            "kits",
            86400
        ).start();
    }
}
