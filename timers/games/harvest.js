/**
 * @typedef {import("../../RebirthRusher.js")} RebirthRusher
 * @typedef {import("eris").Message} Message 
 */

const UserDB = require("../../database/controllers/userController");
const Timer = require("../../system/Timer");

module.exports.name = "harvest"

/**
 * Starts harvest timer
 * @param {RebirthRusher} bot RbR Discord client
 * @param {Message} message triggering Discord message
 * @param {string} userID user's Discord ID
 */
module.exports.execute = async function (bot, message, userID, harvestTime) {
    const user = await UserDB.getUserById(userID);

    if (user.timers.games.harvest === "ready") {
        await new Timer(
            bot,
            message,
            userID,
            "harvest",
            "games",
            harvestTime
        ).start();
    }
}
