/**
 * @typedef {import("../../RebirthRusher.js")} RebirthRusher
 * @typedef {import("eris").Message} Message 
 */

const UserDB = require("../../database/controllers/userController");
const Timer = require("../../system/Timer");

module.exports.name = "rage"
module.exports.aliases = ["r", "wither"]

/**
 * Starts rage timer
 * @param {RebirthRusher} bot RbR Discord client
 * @param {Message} message triggering Discord message
 * @param {string} userID user's Discord ID
 */
module.exports.execute = async function (bot, message, userID) {
    const user = await UserDB.getUserById(userID);

    if (user.timers.abilities.rage === "ready") {
        await new Timer(
            bot,
            message,
            user,
            "rage",
            "abilities",
            420 - 60 * user.pets.wither
        ).start();

        return bot.timers.get("booster").execute(bot,
            message,
            userID,
            "rage",
            60
        );
    }
}
